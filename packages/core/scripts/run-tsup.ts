import { spawn } from "child_process";

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

  tsupProcess.on("error", (error) => {
    console.error("Error starting tsup:", error);
  });

  tsupProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`tsup exited with code ${code}`);
    }
  });

  return tsupProcess;
}
