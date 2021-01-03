import * as CP from "child_process";
import * as Tmp from "tmp-promise";
import * as Fs from "fs-extra";
import * as Path from "path";

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

export const splitLines = (input: string) =>
  input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !!line);

const tmpDir = () => Tmp.dir().then((dir) => Path.join(dir.path, "bzr"));

export const branch = (bzr: TBzr, baseDir: string) => async (
  repo: string,
  localDir = ".",
  args: string[] = [],
) => {
  // bzr doesn't support existing directories
  const useTmp = Path.join(baseDir, localDir) === baseDir;
  const path = useTmp ? await tmpDir() : localDir;

  const resp = bzr(["branch", repo, path, ...args]);

  if (useTmp) {
    await Fs.move(path, baseDir, { overwrite: true });
  }

  return resp;
};

export const tags = (bzr: TBzr) => (args: string[] = ["--sort=time"]) =>
  bzr(["tags", ...args]).then(nthColumn(0));

export const ls = (bzr: TBzr) => (args: string[] = ["-R"]) =>
  bzr(["ls", ...args]).then(splitLines);

export type TBzrWrapper = ReturnType<typeof factory>;
export default function factory(baseDir: string, opts?: Partial<TOptions>) {
  const bzr = createRaw(baseDir, opts);

  return {
    baseDir: () => baseDir,
    raw: bzr,
    branch: branch(bzr, baseDir),
    ls: ls(bzr),
    tags: tags(bzr),
  };
}
