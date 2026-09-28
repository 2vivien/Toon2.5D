import type {FaceParameter,FaceWeights,Vec3} from "../types.js";

export type BlendMode="add"|"override"|"multiply"|"max"|"min";
export type ExpressionSourceId="base"|"emotion"|"animation"|"lipSync"|"blink"|"lookAt"|"external";

export interface ExpressionContribution{
  readonly source:ExpressionSourceId;
  readonly parameter:FaceParameter;
  readonly value:number;
  readonly weight:number;
  readonly priority:number;
  readonly mode:BlendMode;
}

export interface ExpressionContext{
  readonly deltaSeconds:number;
  readonly elapsedSeconds:number;
  readonly lookTarget:Vec3|null;
}

export interface ExpressionSource{
  readonly id:ExpressionSourceId;
  evaluate(context:ExpressionContext):readonly ExpressionContribution[];
}

export interface ExpressionFrame{
  readonly weights:FaceWeights;
  readonly contributions:readonly ExpressionContribution[];
}