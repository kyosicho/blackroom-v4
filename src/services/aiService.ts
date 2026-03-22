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
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Base64 데이터에서 실제 데이터 부분만 추출
    const base64Data = base64Image.split(",")[1];
    
    const prompt = `
      이 이미지는 타투 시술용 바늘(Needle) 또는 색소(Pigment/Ink) 사진입니다.
      사진에서 다음 정보를 추출하여 정확한 JSON 형식으로만 응답해 주세요:
      1. pigmentBrand: 색소 브랜드명 (없으면 null)
      2. pigmentColor: 색소 컬러명 (없으면 null)
      3. lotNumber: 제조번호 또는 Lot No. (없으면 "N/A")
      4. needleType: 바늘 형태 (예: 1RL, 3RL, 11MAG 등)
      5. needleSize: 바늘 굵기 (예: 0.25mm, 0.30mm 등)
      6. notes: AI의 추가 분석 메모 (예: 정품 여부, 유효기간 확인 등)

      응답은 반드시 JSON 코드 블록 없이 순수 JSON 문자열로만 보내주세요.
      예: {"pigmentBrand": "...", "pigmentColor": "...", ...}
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

    const responseText = result.response.text();
    console.log("AI Response Raw:", responseText);

    // JSON 파싱 (가끔씩 생기는 코드 블록 제거 처리)
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      pigmentBrand: parsed.pigmentBrand || '미판독',
      pigmentColor: parsed.pigmentColor || '미판독',
      lotNumber: parsed.lotNumber || 'N/A',
      needleType: parsed.needleType || '미판독',
      needleSize: parsed.needleSize || '미판독',
      notes: parsed.notes || 'AI가 이미지를 분석했습니다.',
      scannedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("AI Scan Error:", error);
    throw new Error("이미지 분석 중 오류가 발생했습니다.");
  }
};
