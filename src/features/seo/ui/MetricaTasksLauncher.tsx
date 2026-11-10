"use client";

import { Button } from "antd";
import { SEO_ACTIONS, useSeoScopes } from "../hooks/useSeoScopes";
import { useMetricaTasksDialog } from "../hooks/useMetricaTasksDialog";
import { MetricaTasksModal } from "./MetricaTasksModal";

export function MetricaTasksLauncher({ bindingKey }: { bindingKey: string }) {
  const { hasPermission } = useSeoScopes();
  if (!hasPermission(SEO_ACTIONS.LIST_METRICA_TASKS)) return null;
  return <TasksSession key={bindingKey} bindingKey={bindingKey} />;
}

function TasksSession({ bindingKey }: { bindingKey: string }) {
  const model = useMetricaTasksDialog(bindingKey);
  return <>
    <Button ref={model.trigger} onClick={model.show}>Задачи</Button>
    <MetricaTasksModal model={model} />
  </>;
}
