"use dom";

import "survey-core/survey-core.css";
import { useEffect, useState } from "react";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";

interface SurveyFormDomProps {
  schema: object;
  data: object;
  onValueChanged: (data: object) => Promise<void>;
  onComplete: (data: object) => Promise<void>;
  dom?: import("expo/dom").DOMProps;
}

export default function SurveyFormDom({
  schema,
  data,
  onValueChanged,
  onComplete,
}: SurveyFormDomProps) {
  const [survey, setSurvey] = useState<Model | null>(null);

  useEffect(() => {
    const hasSchema =
      schema && typeof schema === "object" && Object.keys(schema).length > 0;
    const model = new Model(hasSchema ? schema : { elements: [] });

    if (data && Object.keys(data).length > 0) {
      model.data = data;
    }

    model.onValueChanged.add((_sender: Model) => {
      onValueChanged(_sender.data);
    });

    model.onComplete.add((_sender: Model) => {
      onComplete(_sender.data);
    });

    setSurvey(model);
  }, []);

  if (!survey) return null;

  return (
    <div style={{ width: "100%", minHeight: "100vh" }}>
      <Survey model={survey} />
    </div>
  );
}
