import type {ExpressionContribution,ExpressionContext,ExpressionSource,FaceWeights}from"@toon2.5d/core";
import type {AnimationPlayer}from"./player.js";

export function animationSource(player:AnimationPlayer):ExpressionSource{
  return {
    id:"animation",
    evaluate(_context:ExpressionContext):readonly ExpressionContribution[]{
      const values:FaceWeights=player.output();
      const contributions:ExpressionContribution[]=[];
      for(const parameter of Object.keys(values) as Array<keyof FaceWeights>){
        const value=values[parameter];
        if(value>0)contributions.push({
          source:"animation",parameter,value,weight:1,priority:30,mode:"add"
        });
      }
      return contributions;
    }
  };
}