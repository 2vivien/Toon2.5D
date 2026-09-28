import {FACE_PARAMETERS}from"@toon2.5d/core";
import type {ExpressionContribution,ExpressionContext,ExpressionSource,FaceWeights}from"@toon2.5d/core";
import type {AnimationPlayer}from"./player.js";

export function animationSource(player:AnimationPlayer):ExpressionSource{
  const contributions:ExpressionContribution[]=[];
  return {
    id:"animation",
    evaluate(context:ExpressionContext):readonly ExpressionContribution[]{
      player.update(context.deltaSeconds);
      contributions.length=0;
      const values:FaceWeights=player.output();
      for(const parameter of FACE_PARAMETERS){
        const value=values[parameter];
        if(value>0)contributions.push({source:"animation",parameter,value,weight:1,priority:30,mode:"add"});
      }
      return contributions;
    }
  };
}
