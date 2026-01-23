export type CompileContext = {
  src: string;
  dist: string;
};

export type FileInfo = {
  type: string;
  path: string;
  directory: string;
  filename: string;
  ext: string;
};

export type CompiledFile = {
  filename: string;
  content: string;
};
