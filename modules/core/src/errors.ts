export type CoreErrorCode =
  | "INVALID_DEFINITION" | "INVALID_NUMBER" | "INVALID_PARAMETER" | "INVALID_LIFECYCLE";

export class ToonCoreError extends Error {
  readonly code: CoreErrorCode;
  constructor(code:CoreErrorCode,message:string) {
    super(message);
    this.name="ToonCoreError";
    this.code=code;
  }
}