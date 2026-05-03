"use dom";

import "survey-core/survey-core.css";
import "survey-creator-core/survey-creator-core.css";
import { useEffect, useState } from "react";
import {
  SurveyCreator,
  SurveyCreatorComponent,
} from "survey-creator-react";

interface SurveyCreatorDomProps {
  json: object;
  onSave: (json: object) => Promise<void>;
  dom?: import("expo/dom").DOMProps;
}

export default function SurveyCreatorDom({
  json,
  onSave,
}: SurveyCreatorDomProps) {
  const [creator, setCreator] = useState<SurveyCreator | null>(null);

  useEffect(() => {
    const c = new SurveyCreator({
      autoSaveEnabled: true,
      collapseOnDrag: true,
      showThemeTab: false,
      showLogicTab: true,
    });

    c.JSON = json && Object.keys(json).length > 0 ? json : {};

    c.saveSurveyFunc = (
      saveNo: number,
      callback: (num: number, status: boolean) => void,
    ) => {
      onSave(c.JSON)
        .then(() => callback(saveNo, true))
        .catch(() => callback(saveNo, false));
    };

    setCreator(c);
  }, []);

  if (!creator) return null;

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <SurveyCreatorComponent creator={creator} />
    </div>
  );
}
