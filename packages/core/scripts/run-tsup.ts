import { spawn } from "node:child_process";

type TsupFlag = "watch";

export function runTsup(...flags: TsupFlag[]) {
  const tsupProcess = spawn(
    "pnpm",
    ["exec", "tsup", ...flags.map((flag) => `--${flag}`)],
    {
      stdio: "pipe",
      shell: true,
    },
  );

  tsupProcess.on("error", (error: Error) => {
    console.error("Error starting tsup:", error);
  });

  tsupProcess.on("exit", (code: number | null) => {
    if (code !== 0 && code !== null) {
      console.error(`tsup exited with code ${code}`);
    }
  });

  return tsupProcess;
}
