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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
        "lotNumber": "제조번호 (없으면 null)",
        "needleType": "바늘 형태 (예: 1RL, 3RL, 11MAG)",
        "needleSize": "바늘 굵기 (예: 0.25mm, 0.30mm)",
        "notes": "추가 분석 메모"
      }

      반드시 JSON 코드 블록(\`\`\`json) 없이 순수 JSON 객체 문자열만 응답하세요.
    `;

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
    console.log("AI Response Raw Content:", responseText);

    try {
      // JSON 파싱 시도 (코드 블록이나 불필요한 텍스트 제거)
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
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
      // JSON 파싱 실패 시 텍스트라도 응답
      return {
        pigmentBrand: '판독 오류',
        pigmentColor: '텍스트 응답 확인 필요',
        lotNumber: 'N/A',
        needleType: 'N/A',
        needleSize: 'N/A',
        notes: `AI가 JSON 형식이 아닌 텍스트로 응답했습니다: ${responseText.substring(0, 100)}...`,
        scannedAt: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    console.error("AI Scan Core Error:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("유효하지 않은 API 키입니다. 키 발급 상태를 확인해 주세요.");
    }
    throw new Error(`이미지 분석 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
  }
};
