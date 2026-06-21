declare module "srt-parser-2" {
  type SrtEntry = {
    id: string;
    startTime: string;
    endTime: string;
    text: string;
  };

  export default class SrtParser2 {
    fromSrt(input: string): SrtEntry[];
  }
}
