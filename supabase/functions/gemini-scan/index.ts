import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { base64Image, mimeType } = await req.json();

    if (!base64Image) {
      return new Response(
        JSON.stringify({ error: "이미지 데이터가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gemini API 키는 서버 환경변수에서만 가져옴 (절대 외부 노출 없음)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "서버에 API 키가 설정되지 않았습니다." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `
      이 이미지는 타투 또는 반영구 시술에 사용되는 바늘(Needle/Cartridge)과 색소(Pigment/Ink) 사진입니다.
      포장지, 라벨, 용기에 적힌 아주 작은 글씨까지 꼼꼼하게 읽고, 사진에서 보이는 **모든** 색소와 **모든** 바늘 정보를 빠짐없이 추출해 주세요.
      
      바늘(Needle/Cartridge) 판독 초정밀 가이드:
      - 주요 바늘 브랜드: Mast(Ocean Heart, Mast Pro), Kwadron(콰드론), MADKOR(매드코어), Dragonhawk, Cheyenne, Vertix, Bishop, EZ, Blackroom, WJX, Bigasp 등
      - 규격 표기 패턴 1 (코드형): "1203RL" -> 12(0.35mm 두께), 03(바늘 개수), RL(타입: Round Liner)
      - 규격 표기 패턴 2 (직접형): "25/1RLLT" -> 25(0.25mm 두께), 1(바늘 개수), RL(타입), LT(Long Taper)
      - 바늘 두께 코드: 04(0.20mm), 06(0.22-0.25mm), 08(0.25mm), 10(0.30mm), 12(0.35mm)
      - 바늘 타입: RL(Round Liner - 라인), RS(Round Shader - 명암), RM/SEM(Round Magnum - 부드러운 명암), M/MG(Magnum - 채우기), F(Flat - 평면)
      - "needles" 배열 항목 예: "Mast Ocean Heart 1201RL", "Kwadron 25/3RLLT"

      색소(Pigment) 판독 초정밀 가이드:
      - 주요 색소 브랜드: World Famous(월드페이머스), Dynamic(다이나믹), Intenze(인텐즈), Fusion(퓨전), Solid(솔리드), Perma Blend, Tina Davies, Evenflo, Intenze, Eternal, Biotouch 등
      - "Union Black"(유니온 블랙)은 다이나믹(Dynamic) 브랜드의 대표적인 블랙 잉크입니다.
      - "Mixing/Shading Solution"(믹싱/쉐이딩 솔루션)은 잉크 희석액입니다.
      - "Green Soap"(그린솝)은 잉크 클렌저입니다.
      - "pigments" 배열 항목 예: "World Famous Poncho Grey", "Dynamic Union Black", "Intenze Color Mixing Solution"
      - 제조번호(LOT)가 보이면 별도 필드에 꼭 추출하세요.

      정확한 JSON 형식으로만 응답해 주세요:
      {
        "pigments": ["브랜드 컬러명1", "브랜드 컬러명2"],
        "needles": ["브랜드 형태 굵기1", "브랜드 형태 굵기2"],
        "pigmentBrand": "대표 브랜드 (없으면 빈 문자열)",
        "pigmentColor": "대표 컬러 (없으면 빈 문자열)",
        "lotNumber": "제조번호 (없으면 빈 문자열)",
        "needleType": "대표 형태 (없으면 빈 문자열)",
        "needleSize": "대표 굵기 (없으면 빈 문자열)",
        "notes": "추가 분석 메모 (한국어로 작성, 바늘의 특징이나 용도 등 포함)"
      }

      중요: 여러 개의 재료가 찍혔다면 절대 빠뜨리지 말고 모두 배열에 담으세요.
      반드시 JSON 코드 블록(\`\`\`json) 없이 순수 JSON 객체 문자열만 응답하세요. 
    `;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API 오류:", errText);
      return new Response(
        JSON.stringify({ error: `Gemini API 오류: ${geminiRes.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, "").trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI 응답 파싱 실패", raw: responseText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitize = (val: unknown) => (val && val !== "null" ? String(val) : "");
    const sanitizeArray = (val: unknown): string[] => {
      if (Array.isArray(val)) return val.map((v) => sanitize(v)).filter(Boolean);
      return [];
    };

    const result = {
      pigmentBrand: sanitize(parsed.pigmentBrand),
      pigmentColor: sanitize(parsed.pigmentColor),
      lotNumber: sanitize(parsed.lotNumber),
      needleType: sanitize(parsed.needleType),
      needleSize: sanitize(parsed.needleSize),
      notes: sanitize(parsed.notes) || "AI 분석 완료",
      scannedAt: new Date().toISOString(),
      pigments: sanitizeArray(parsed.pigments),
      needles: sanitizeArray(parsed.needles),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge Function 오류:", err);
    return new Response(
      JSON.stringify({ error: "서버 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
