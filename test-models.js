import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyAl_yKzV21B5H19SH5TT27Zz31MH4_q-ho";
const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await models.generateContent("Hello?");
    console.log("gemini-1.5-flash-latest SUCCESS:", result.response.text());
  } catch (e) {
    console.error("gemini-1.5-flash-latest ERROR:", e.message);
  }

  const testModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash-lite-001"];
  
  for (const modelName of testModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello?");
      console.log(`✅ ${modelName} SUCCESS:`, result.response.text());
      break; // 성공하면 중단
    } catch (e) {
      console.error(`❌ ${modelName} ERROR:`, e.details || e.message);
    }
  }
}

checkModels();

