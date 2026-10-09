import {schema} from './planner-document_GET.schema';
import {plannerRelease} from '../helpers/plannerRelease';

export async function handle(request:Request) {
  const input = schema.safeParse({lang:new URL(request.url).searchParams.get('lang') ?? 'ru'});
  const headers = {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'};
  if (!input.success) return new Response(JSON.stringify({error:'Неизвестный язык'}), {status:400, headers});
  try {
    return new Response(JSON.stringify(await plannerRelease.read(input.data.lang)), {headers});
  } catch (error) {
    console.error('planner-document:', error instanceof Error ? error.message : String(error));
    return new Response(JSON.stringify({error:error instanceof Error ? error.message : 'Не удалось загрузить планировщик'}), {status:503, headers});
  }
}
