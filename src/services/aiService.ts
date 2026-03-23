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
      이 이미지는 타투 시술용 바늘(Needle) 또는 색소(Pigment/Ink) 사진입니다.
      사진에서 다음 정보를 추출하여 정확한 JSON 형식으로만 응답해 주세요:
      {
        "pigmentBrand": "색소 브랜드명 (없으면 null)",
        "pigmentColor": "색소 컬러명 (없으면 null)",
        "lotNumber": "색소 용기에서 찾은 제조번호 또는 로트번호 (없으면 null)",
        "needleType": "바늘 형태 (예: 1RL, 3RL, 11MAG, 1P, 3P 등)",
        "needleSize": "바늘 굵기 (예: 0.25mm, 0.30mm, 0.35mm)",
        "notes": "추가 분석 메모 (한국어로 작성)"
      }

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
      const parsed = JSON.parse(cleanJson);

      return {
        pigmentBrand: parsed.pigmentBrand || '미판독',
        pigmentColor: parsed.pigmentColor || '미판독',
        lotNumber: parsed.lotNumber || 'N/A',
        needleType: parsed.needleType || '미판독',
        needleSize: parsed.needleSize || '미판독',
        notes: parsed.notes || 'AI 분석 완료',
        scannedAt: new Date().toISOString(),
      };
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError, "Raw Text:", responseText);
      return {
        pigmentBrand: '판독 오류',
        pigmentColor: '텍스트 응답 확인 필요',
        lotNumber: 'N/A',
        needleType: 'N/A',
        needleSize: 'N/A',
        notes: `AI가 JSON 형식이 아닌 일반 텍스트로 응답했습니다: ${responseText.substring(0, 100)}...`,
        scannedAt: new Date().toISOString(),
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
