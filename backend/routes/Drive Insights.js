app.post("/diagnose", async (req, res) => {

  try {

    const { problem } = req.body;

    console.log("User problem:", problem);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert automobile mechanic."
        },
        {
          role: "user",
          content: `Analyze this car problem and return JSON format with:
problemSummary, possibleCauses, suggestedSolutions, preventionTips.

Problem: ${problem}`
        }
      ]
    });

    const aiText = response.choices[0].message.content;

    console.log("AI response:", aiText);

    let aiResult;

    try {
      aiResult = JSON.parse(aiText);
    } catch {
      aiResult = {
        problemSummary: aiText,
        possibleCauses: [],
        suggestedSolutions: [],
        preventionTips: []
      };
    }

    const newDiagnosis = new Diagnosis({ problem });
    await newDiagnosis.save();

    res.json(aiResult);

  } catch (error) {

    console.error("AI ERROR:", error);

    res.status(500).json({ error: "AI diagnosis failed" });

  }

});