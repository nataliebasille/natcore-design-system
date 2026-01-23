import { spawn } from "child_process";

type TsupFlags = "watch";
export function runTsup(...flags: TsupFlags[]) {
  const tsupProcess = spawn(
    "pnpm",
    ["exec", "tsup", ...flags.map((flag) => `--${flag}`)],
    {
      stdio: "pipe", // Changed from "inherit" to capture output
      shell: true,
    },
  );

  tsupProcess.on("error", (error) => {
    console.error("❌ Error starting tsup:", error);
  });

  tsupProcess.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ tsup exited with code ${code}`);
    }
  });

  return tsupProcess;
}
