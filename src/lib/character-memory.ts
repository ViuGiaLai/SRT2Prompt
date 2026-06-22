import type { CharacterBible, ScenePrompt, StoryboardScene } from "./types";

/**
 * Compiles a single scene prompt by combining visual art style, consistent character bible parameters,
 * scene summary, and director modifiers (camera angle, lighting, emotion).
 */
export function compileScenePrompt(
  scene: {
    summary: string;
    cameraAngle?: string;
    lighting?: string;
    emotion?: string;
  },
  character: CharacterBible,
  imageStyle: string
): string {
  const style = imageStyle || "Dark Cinematic";
  
  // Extract and build character description based on simplified 4 core pillars
  const charDetails: string[] = [];
  if (character.age) charDetails.push(character.age.trim());
  if (character.gender) charDetails.push(character.gender.trim());
  if (character.hair) charDetails.push(`with ${character.hair.trim().toLowerCase()}`);
  if (character.clothes) charDetails.push(`wearing ${character.clothes.trim().toLowerCase()}`);
  
  const charDesc = charDetails.length > 0 
    ? `${character.name || "Main character"} (${charDetails.join(", ")})`
    : character.name || "Main character";

  // Camera angle, lighting, and emotion modifiers
  const camera = scene.cameraAngle ? scene.cameraAngle.trim().toLowerCase() : "";
  const light = scene.lighting ? scene.lighting.trim().toLowerCase() : "";
  const emotion = scene.emotion ? `${scene.emotion.trim().toLowerCase()} expression` : "";

  const modifiers = [camera, light, emotion].filter(Boolean).join(", ");
  
  // Build prompt
  let prompt = `${style} scene showing ${charDesc}. Scene context: ${scene.summary.trim()}`;
  
  if (modifiers) {
    prompt += `. Camera & Lighting style: ${modifiers}`;
  }
  
  // Inject instructions to force AI consistency
  prompt += `. Maintaining strict visual identity and consistent wardrobe across scenes, high detail.`;
  
  return prompt;
}

/**
 * Updates all scene prompts and storyboard items in a ContentPack based on character visual parameters.
 */
export function syncCharacterMemory(
  scenePrompts: ScenePrompt[],
  storyboard: StoryboardScene[],
  character: CharacterBible,
  imageStyle: string
): { scenePrompts: ScenePrompt[]; storyboard: StoryboardScene[] } {
  const updatedScenes = scenePrompts.map((scene) => ({
    ...scene,
    imagePrompt: compileScenePrompt(scene, character, imageStyle)
  }));

  const updatedStoryboard = storyboard.map((scene) => ({
    ...scene,
    imagePrompt: compileScenePrompt(scene, character, imageStyle)
  }));

  return {
    scenePrompts: updatedScenes,
    storyboard: updatedStoryboard
  };
}
