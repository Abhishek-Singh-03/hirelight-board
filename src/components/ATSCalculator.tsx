"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ATSCalculatorProps {
  jobDescription: string;
}

export function ATSCalculator({ jobDescription }: ATSCalculatorProps) {
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const calculateATSScore = () => {
    if (!resumeText) return;

    const jdWords = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);
    const resumeWords = resumeText
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/);

    const uniqueJDWords = Array.from(new Set(jdWords));
    const matchedWords = uniqueJDWords.filter((word) => resumeWords.includes(word));

    const atsScore = Math.round((matchedWords.length / uniqueJDWords.length) * 100);
    setScore(atsScore);
  };

  return (
    <Card className="p-6 mt-8 shadow-lg max-w-2xl mx-auto">
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Resume ATS Score Calculator</h2>

        <textarea
          placeholder="Paste your resume text here..."
          className="w-full border rounded p-3 h-40 text-sm"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />

        <Button onClick={calculateATSScore} className="w-full">
          Calculate ATS Score
        </Button>

        {score !== null && (
          <div className="text-center mt-2 text-lg font-semibold">
            ATS Score: <span className="text-primary">{score}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
