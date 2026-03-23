import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIScanResult } from "../types/types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * 이미지(Base64)를 분석하여 타투 바늘 및 색소 정보를 추출합니다.
 * @param base64Image "data:image/jpeg;base64,..." 형태의 이미지 데이터
 * @returns 판독된 결과 객체
 */
export const scanMaterialImage = async (base64Image: string): Promise<AIScanResult> => {
  if (!API_KEY) {
    console.error("Gemini API Key is missing. Please check your .env.local file and restart the server.");
    throw new Error("API 키가 설정되지 않았습니다. .env.local 파일을 확인하고 서버를 재시작해 주세요.");
  }

  try {
    console.log("Starting AI Scan with Gemini...");
    const maskedKey = API_KEY ? `${API_KEY.substring(0, 6)}***${API_KEY.substring(API_KEY.length - 4)}` : "MISSING";
    console.log("Gemini API Key Loaded:", maskedKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Base64 데이터 추출 및 형식 확인
    const parts = base64Image.split(",");
    if (parts.length < 2) {
      throw new Error("이미지 데이터 형식이 올바르지 않습니다.");
    }
    const base64Data = parts[1];
    
    const prompt = `
      이 이미지는 타투 또는 반영구 시술에 사용되는 바늘(Needle)과 색소(Pigment/Ink) 사진입니다.
      포장지, 라벨, 용기에 적힌 글씨를 꼼꼼하게 읽고, 사진에서 보이는 **모든** 색소와 **모든** 바늘 정보를 빠짐없이 추출해 주세요.
      여러 개의 색소나 바늘이 보이면 반드시 배열에 모두 포함해야 합니다.
      
      바늘(Needle) 판독 가이드:
      - 바늘 형태 예시: 1RL, 3RL, 5RL, 7RL, 9RL, 11RL, 14RL, 1P, 3P, 5P, 7MAG, 9MAG, 11MAG, 13MAG, 15MAG, 5RS, 7RS, 9RS, 5F, 7F, 9F, 1R, 3R, U1 등
      - 바늘 굵기 예시: 0.18mm, 0.20mm, 0.25mm, 0.30mm, 0.35mm, 0.40mm
      - "needles" 배열에는 "형태 굵기"를 합쳐서 적어주세요 (예: "1RL 0.25mm", "5MAG 0.35mm")
      - 포장지에 숫자와 알파벳 조합이 보이면 바늘 형태일 가능성이 높습니다

      색소(Pigment) 판독 가이드:
      - "pigments" 배열에는 "브랜드명 컬러명"을 합쳐서 적어주세요 (예: "EB22 다크 브라운", "Perma Blend Onyx")
      - 용기나 라벨에 적힌 브랜드, 색상명, LOT 번호를 최대한 정확히 읽어주세요

      정확한 JSON 형식으로만 응답해 주세요:
      {
        "pigments": ["브랜드1 컬러명1", "브랜드2 컬러명2"],
        "needles": ["1RL 0.25mm", "5MAG 0.35mm"],
        "pigmentBrand": "대표 색소 브랜드명 (없으면 빈 문자열)",
        "pigmentColor": "대표 색소 컬러명 (없으면 빈 문자열)",
        "lotNumber": "제조번호 (없으면 빈 문자열)",
        "needleType": "대표 바늘 형태 예: 1RL, 3RL, 11MAG (없으면 빈 문자열)",
        "needleSize": "대표 바늘 굵기 예: 0.25mm, 0.30mm (없으면 빈 문자열)",
        "notes": "추가 분석 메모 (한국어로 작성)"
      }

      중요: pigments 배열과 needles 배열에는 사진에서 인식 가능한 모든 항목을 넣어 주세요.
      포장지의 작은 글씨도 주의 깊게 읽어주세요.
      반드시 JSON 코드 블록(\`\`\`json) 없이 순수 JSON 객체 문자열만 응답하세요. 
      텍스트 설명이나 인사는 생략하고 오직 JSON 데이터만 출력하세요.
    `;

    console.log("Sending request to Gemini model...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const responseText = response.text();
    console.log("AI Response Received Successfully");

    try {
      // JSON 파싱 시도: 정규표현식을 사용하여 JSON 객체 부분만 추출 (더 견고한 파싱)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : responseText.replace(/```json|```/g, "").trim();
      let parsed = JSON.parse(cleanJson);
      
      // null, 'null' 등을 빈 문자열로 처리
      const sanitize = (val: any) => (val && val !== 'null' ? String(val) : '');
      
      // 배열 필드 처리
      const sanitizeArray = (val: any): string[] => {
        if (Array.isArray(val)) return val.map((v: any) => sanitize(v)).filter(Boolean);
        return [];
      };

      return {
        pigmentBrand: sanitize(parsed.pigmentBrand),
        pigmentColor: sanitize(parsed.pigmentColor),
        lotNumber: sanitize(parsed.lotNumber),
        needleType: sanitize(parsed.needleType),
        needleSize: sanitize(parsed.needleSize),
        notes: sanitize(parsed.notes) || 'AI 분석 완료',
        scannedAt: new Date().toISOString(),
        pigments: sanitizeArray(parsed.pigments),
        needles: sanitizeArray(parsed.needles),
      };
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError, "Raw Text:", responseText);
      return {
        pigmentBrand: '',
        pigmentColor: '',
        lotNumber: '',
        needleType: '',
        needleSize: '',
        notes: `AI 텍스트 응답 분석 실패: ${responseText.substring(0, 50)}...`,
        scannedAt: new Date().toISOString(),
        pigments: [],
        needles: [],
      };
    }
  } catch (error: any) {
    console.error("AI Scan Core Error Details:", error);
    
    let errorMessage = error.message || '알 수 없는 오류';
    
    if (errorMessage.includes("API_KEY_INVALID")) {
      errorMessage = "유효하지 않은 API 키입니다. Google AI Studio에서 키 상태를 확인해 주세요.";
    } else if (errorMessage.includes("SAFETY")) {
      errorMessage = "거절됨: 이미지에 부적절하거나 안전 가이드라인에 위배되는 내용이 포함되어 있을 수 있습니다.";
    } else if (errorMessage.includes("fetch failed")) {
      errorMessage = "네트워크 오류: Google 서버에 연결할 수 없습니다. 인터넷 상태를 확인해 주세요.";
    }
    
    throw new Error(`이미지 분석 실패: ${errorMessage}`);
  }
};
