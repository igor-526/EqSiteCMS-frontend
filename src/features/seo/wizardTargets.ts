import { createElement } from "react";
import type { WizardTarget } from "./ui/ConnectionWizardModal";
import { MetricaCounterStep } from "./ui/MetricaCounterStep";

export const METRICA_WIZARD_TARGET: WizardTarget = {
  key: "metrica",
  title: "Привязать Яндекс.Метрику",
  stepTitle: "Счётчик Метрики",
  renderStep: (props) => createElement(MetricaCounterStep, props),
};
