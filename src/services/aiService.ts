import type { AIScanResult } from "../types/types";

// Supabase Edge Function URL (API 키는 서버에만 보관, 앱에는 없음)
const EDGE_FUNCTION_URL =
  "https://dhxffxhiiypfskpamoea.supabase.co/functions/v1/gemini-scan";

/**
 * 이미지(Base64)를 분석하여 타투 바늘 및 색소 정보를 추출합니다.
 * Gemini API는 Supabase Edge Function(서버)을 통해 안전하게 호출됩니다.
 * @param base64Image "data:image/jpeg;base64,..." 형태의 이미지 데이터
 * @returns 판독된 결과 객체
 */
export const scanMaterialImage = async (base64Image: string): Promise<AIScanResult> => {
  try {
    console.log("Starting AI Scan via Supabase Edge Function...");

    // Base64 데이터 추출 및 형식 확인
    const parts = base64Image.split(",");
    if (parts.length < 2) {
      throw new Error("이미지 데이터 형식이 올바르지 않습니다.");
    }

    // mimeType 추출 (예: "data:image/jpeg;base64" → "image/jpeg")
    const mimeMatch = parts[0].match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64Data = parts[1];

    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64Image: base64Data,
        mimeType,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: "알 수 없는 오류" }));
      throw new Error(errData.error || `서버 오류: ${response.status}`);
    }

    const result = await response.json();
    console.log("AI Scan completed successfully via Edge Function");

    return result as AIScanResult;
  } catch (error: any) {
    console.error("AI Scan Error:", error);

    let errorMessage = error.message || "알 수 없는 오류";

    if (errorMessage.includes("fetch failed") || errorMessage.includes("Failed to fetch")) {
      errorMessage = "네트워크 오류: 서버에 연결할 수 없습니다. 인터넷 상태를 확인해 주세요.";
    }

    throw new Error(`이미지 분석 실패: ${errorMessage}`);
  }
};
