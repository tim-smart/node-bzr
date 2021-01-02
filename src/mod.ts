import * as CP from "child_process";

export type TBzr = (args: string[]) => Promise<string>;
export type TOptions = {
  /** Path to bzr binary */
  bzrBin: string;
};

export function createRaw(
  baseDir: string,
  { bzrBin = "bzr" }: Partial<TOptions> = {},
): TBzr {
  return (args) =>
    new Promise((resolve, reject) => {
      CP.execFile(
        bzrBin,
        args,
        { encoding: "utf8", cwd: baseDir },
        (err, stdout) => {
          if (err) {
            return reject(err);
          }
          resolve(stdout.trim());
        },
      );
    });
}

export const nthColumn = (column: number) => (input: string): string[] =>
  input
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[column])
    .filter((s) => !!s);

export const tags = (bzr: TBzr) =>
  bzr(["tags", "--sort=time"]).then(nthColumn(0));

export default function factory(baseDir: string, opts?: Partial<TOptions>) {
  const bzr = createRaw(baseDir, opts);

  return {
    raw: bzr,
    tags: () => tags(bzr),
  };
}
