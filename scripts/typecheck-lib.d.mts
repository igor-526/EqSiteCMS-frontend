export type TypecheckPaths = {
  outputDirectory: string;
  configPath: string;
};

export type TypecheckCommand = (
  command: string,
  arguments_: string[],
  options?: { cwd?: string; env?: NodeJS.ProcessEnv },
) => Promise<void>;

export function createTypecheckPaths(runId: string): TypecheckPaths;
export function runIsolatedTypecheck(options: {
  runId: string;
  execute?: TypecheckCommand;
  projectDirectory?: string;
}): Promise<void>;
