import unzipper from "unzipper";

export type ParsedLogFile = {
  filename: string;
  content: string;
};

type ZipEntry = {
  type: string;
  path: string;
  buffer: () => Promise<Buffer>;
};

export const parseZipLogs = async (buffer: Buffer): Promise<ParsedLogFile[]> => {
  const directory = await unzipper.Open.buffer(buffer);
  const entries = directory.files as ZipEntry[];

  const files = await Promise.all(
    entries
      .filter((entry) => entry.type === "File")
      .map(async (entry) => {
        const content = await entry.buffer();
        return {
          filename: entry.path,
          content: content.toString("utf8")
        };
      })
  );

  return files;
};
