import {z} from 'zod';
export const schema = z.object({lang:z.enum(['ru','en']).default('ru')});
export type OutputType = {html:string; version:string; sourceCommit:string; builtAt:string};
export async function getPlannerDocument(lang:'ru'|'en', signal?:AbortSignal):Promise<OutputType> {
  const response = await fetch(`/_api/planner-document?lang=${lang}`, {signal, cache:'no-store'});
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Не удалось загрузить планировщик');
  }
  return response.json();
}
