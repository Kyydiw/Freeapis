-- Separates the AI and Tools categories and adds new endpoints.
-- Before: category "ai" was named "AI & Tools" and held the /tools/* utilities and
-- /am/* endpoints, while category "tools" ("Developer Tools") held the rest of /tools/*.
begin;

insert into public.categories (name, slug, description, icon, sort_order, is_active) values ('AI', 'ai', 'AI models and chat endpoints.', 'ai', 1, true)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order, is_active = true;
insert into public.categories (name, slug, description, icon, sort_order, is_active) values ('Tools', 'tools', 'Utilities for text, encoding, images, translation, and data.', 'tools', 2, true)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order, is_active = true;
insert into public.categories (name, slug, description, icon, sort_order, is_active) values ('Random Media', 'random', 'Random images, memes, and quotes.', 'image', 12, true)
on conflict (slug) do update set name = excluded.name, description = excluded.description, icon = excluded.icon, sort_order = excluded.sort_order, is_active = true;
update public.categories as c set sort_order = v.sort_order
from (values
  ('downloader', 3),
  ('search', 4),
  ('image', 5),
  ('whatsapp', 6),
  ('information', 7),
  ('platform', 8),
  ('maker', 9),
  ('news', 10),
  ('primbon', 11),
  ('stalker', 13),
  ('anime', 14)
) as v(slug, sort_order)
where c.slug = v.slug;

-- Move utility endpoints out of the AI category into Tools.
update public.api_endpoints
set category_id = (select id from public.categories where slug = 'tools')
where slug in ('tools-info', 'tools-uuid', 'tools-base64', 'tools-hash', 'tools-url-encode', 'alight-motion-send', 'alight-motion-verify');

insert into public.api_endpoints (
  id, category_id, name, slug, public_path, method, description,
  normalizer_id, handler_id, kind, param_schema_id, request_schema,
  response_schema, docs, is_active, lifecycle, cache_ttl, rate_limit, sort_order
) values
(
  '5607ee86-4378-5b51-9992-df436b5f27c7',
  (select id from public.categories where slug = 'ai'),
  'Bhagavad Gita AI', 'ai-gita', '/api/v1/ai/gita', 'GET',
  'Ask a question about the Bhagavad Gita and get an AI-generated answer.',
  'legacy-default-v1', null, 'provider', 'legacy-query-ai-gita',
  '[{"name":"q","type":"string","required":true,"description":"Question to ask, e.g. What is karma?","location":"query","example":"What is karma?"}]'::jsonb,
  '[{"name":"data.result","type":"string","description":"Answer text."}]'::jsonb,
  '{"title":"Bhagavad Gita AI","summary":"Ask a question about the Bhagavad Gita and get an AI-generated answer.","description":"Ask a question about the Bhagavad Gita and receive a text answer. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"q","type":"string","required":true,"description":"Question to ask, e.g. What is karma?","location":"query","example":"What is karma?"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":"Karma is the force that drives the cycle of cause and effect..."}},"responseSchema":[{"name":"data.result","type":"string","description":"Answer text."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 98
),
(
  '9bbc25e9-d68c-5bb6-a83a-19c839e610f2',
  (select id from public.categories where slug = 'ai'),
  'Bible AI', 'ai-bibleai', '/api/v1/ai/bibleai', 'GET',
  'Ask a question about the Bible and get an answer with supporting sources.',
  'legacy-default-v1', null, 'provider', 'legacy-query-ai-bibleai',
  '[{"name":"question","type":"string","required":true,"description":"Question to ask, e.g. What is faith?","location":"query","example":"What is faith?"},{"name":"translation","type":"string","required":false,"description":"Bible translation code, e.g. ESV (optional)","location":"query","example":"ESV"}]'::jsonb,
  '[{"name":"data.result.question","type":"string","description":"The question asked."},{"name":"data.result.translationCode","type":"string","description":"Translation code used."},{"name":"data.result.results.answer","type":"string","description":"Generated answer."},{"name":"data.result.results.sources","type":"array","description":"Verses, books and articles used as sources."},{"name":"data.result.results.metadata","type":"object","description":"Translation and copyright information."}]'::jsonb,
  '{"title":"Bible AI","summary":"Ask a question about the Bible and get an answer with supporting sources.","description":"Ask a question and receive an AI-generated answer grounded in verses, books and articles from the chosen Bible translation. The response can be large because it includes the source passages. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"question","type":"string","required":true,"description":"Question to ask, e.g. What is faith?","location":"query","example":"What is faith?"},{"name":"translation","type":"string","required":false,"description":"Bible translation code, e.g. ESV (optional)","location":"query","example":"ESV"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"question":"What is faith?","translation":"English Standard Version","translationCode":"ESV","results":{"answer":"Faith is...","sources":[{"text":"Now faith is the assurance of things hoped for...","type":"verse","splitReference":{"book":"Hebrews","chapter":11,"verses":[1],"ref":"Hebrews 11:1"}}],"metadata":{"abbreviation":"ESV","translationName":"English Standard Version"}}}}},"responseSchema":[{"name":"data.result.question","type":"string","description":"The question asked."},{"name":"data.result.translationCode","type":"string","description":"Translation code used."},{"name":"data.result.results.answer","type":"string","description":"Generated answer."},{"name":"data.result.results.sources","type":"array","description":"Verses, books and articles used as sources."},{"name":"data.result.results.metadata","type":"object","description":"Translation and copyright information."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 99
),
(
  '02a73814-b53c-5530-9893-9a02e63ee27e',
  (select id from public.categories where slug = 'ai'),
  'PowerBrain AI', 'ai-powerbrain', '/api/v1/ai/powerbrain', 'GET',
  'Chat with the PowerBrain AI.',
  'legacy-default-v1', null, 'provider', 'legacy-query-ai-powerbrain',
  '[{"name":"text","type":"string","required":true,"description":"Message to send, e.g. Halo","location":"query","example":"Halo, apa kabar?"}]'::jsonb,
  '[{"name":"data.result","type":"string","description":"Reply text."}]'::jsonb,
  '{"title":"PowerBrain AI","summary":"Chat with the PowerBrain AI.","description":"Send a text message to PowerBrain AI and receive a text reply. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"text","type":"string","required":true,"description":"Message to send, e.g. Halo","location":"query","example":"Halo, apa kabar?"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":"Halo! Ada yang bisa saya bantu?"}},"responseSchema":[{"name":"data.result","type":"string","description":"Reply text."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 100
),
(
  'ff14cae7-57f5-5673-ae08-aeec2f02756b',
  (select id from public.categories where slug = 'random'),
  'Random Anime Quotes', 'random-quotesanime', '/api/v1/random/quotesanime', 'GET',
  'Get random anime quotes with character and episode details.',
  'legacy-default-v1', null, 'provider', 'legacy-query-random-quotesanime',
  '[]'::jsonb,
  '[{"name":"data.result","type":"array","description":"List of quotes."},{"name":"data.result[].karakter","type":"string","description":"Character name."},{"name":"data.result[].anime","type":"string","description":"Anime title."},{"name":"data.result[].episode","type":"string","description":"Episode label."},{"name":"data.result[].quotes","type":"string","description":"Quote text."},{"name":"data.result[].gambar","type":"string","description":"Image URL."}]'::jsonb,
  '{"title":"Random Anime Quotes","summary":"Get random anime quotes with character and episode details.","description":"Returns a list of random anime quotes with the character, anime title, episode and an image. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":[{"link":"https://example.com/quote/1","gambar":"https://example.com/quote/1.jpg","karakter":"Character name","anime":"Anime title","episode":"Episode 1","up_at":"2026-11-01","quotes":"Quote text"}]}},"responseSchema":[{"name":"data.result","type":"array","description":"List of quotes."},{"name":"data.result[].karakter","type":"string","description":"Character name."},{"name":"data.result[].anime","type":"string","description":"Anime title."},{"name":"data.result[].episode","type":"string","description":"Episode label."},{"name":"data.result[].quotes","type":"string","description":"Quote text."},{"name":"data.result[].gambar","type":"string","description":"Image URL."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":30}'::jsonb, 101
),
(
  'c6f9122c-91c6-54bb-88c9-6635f7132f2e',
  (select id from public.categories where slug = 'random'),
  'Random Lahelu Posts', 'random-lahelu', '/api/v1/random/lahelu', 'GET',
  'Get random meme posts from Lahelu.',
  'legacy-default-v1', null, 'provider', 'legacy-query-random-lahelu',
  '[]'::jsonb,
  '[{"name":"data.result","type":"array","description":"List of posts."},{"name":"data.result[].postId","type":"string","description":"Post ID."},{"name":"data.result[].title","type":"string","description":"Post title."},{"name":"data.result[].media","type":"string","description":"Main media URL."},{"name":"data.result[].isSensitive","type":"boolean","description":"Whether the post is flagged sensitive."},{"name":"data.result[].totalUpvotes","type":"number","description":"Upvote count."}]'::jsonb,
  '{"title":"Random Lahelu Posts","summary":"Get random meme posts from Lahelu.","description":"Returns a list of random posts from Lahelu, including media, hashtags, vote counts and author details. Posts can contain content flagged as sensitive (see the isSensitive field). Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":[{"postId":"abc123","title":"Post title","totalUpvotes":120,"totalDownvotes":3,"totalComments":14,"createTime":"2026-11-14T10:00:00.000Z","isSensitive":false,"hashtags":["meme"],"content":[{"type":1,"value":"https://example.com/media.jpg","width":720,"height":720}],"media":"https://example.com/media.jpg","mediaType":1,"userUsername":"username","topicTitle":"Topic"}]}},"responseSchema":[{"name":"data.result","type":"array","description":"List of posts."},{"name":"data.result[].postId","type":"string","description":"Post ID."},{"name":"data.result[].title","type":"string","description":"Post title."},{"name":"data.result[].media","type":"string","description":"Main media URL."},{"name":"data.result[].isSensitive","type":"boolean","description":"Whether the post is flagged sensitive."},{"name":"data.result[].totalUpvotes","type":"number","description":"Upvote count."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":30}'::jsonb, 102
),
(
  'a106719f-36d2-50d2-86da-be72388207be',
  (select id from public.categories where slug = 'tools'),
  'YouTube Transcript', 'tools-yt-transcribe', '/api/v1/tools/yt-transcribe', 'GET',
  'Get the text transcript of a YouTube video.',
  'legacy-default-v1', null, 'provider', 'legacy-query-tools-yt-transcribe',
  '[{"name":"url","type":"string","required":true,"description":"YouTube video URL","location":"query","example":"https://youtu.be/dQw4w9WgXcQ"}]'::jsonb,
  '[{"name":"data.result.url","type":"string","description":"Video URL."},{"name":"data.result.transcript","type":"string","description":"Transcribed text."}]'::jsonb,
  '{"title":"YouTube Transcript","summary":"Get the text transcript of a YouTube video.","description":"Transcribe a YouTube video from its URL and return the spoken text. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"url","type":"string","required":true,"description":"YouTube video URL","location":"query","example":"https://youtu.be/dQw4w9WgXcQ"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"url":"https://youtu.be/dQw4w9WgXcQ","transcript":"Transcript text..."}}},"responseSchema":[{"name":"data.result.url","type":"string","description":"Video URL."},{"name":"data.result.transcript","type":"string","description":"Transcribed text."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 300, '{"windowSeconds":60,"max":10}'::jsonb, 103
),
(
  '1814cae1-03c2-5075-83a4-aa95f9897a78',
  (select id from public.categories where slug = 'tools'),
  'Website Screenshot', 'tools-ssweb', '/api/v1/tools/ssweb', 'GET',
  'Capture a screenshot of a website and get its metadata.',
  'legacy-default-v1', null, 'provider', 'legacy-query-tools-ssweb',
  '[{"name":"url","type":"string","required":true,"description":"Website URL to capture","location":"query","example":"https://example.com"}]'::jsonb,
  '[{"name":"data.result.title","type":"string","description":"Page title."},{"name":"data.result.description","type":"string","description":"Page description."},{"name":"data.result.url","type":"string","description":"Final page URL."},{"name":"data.result.screenshot.url","type":"string","description":"Screenshot image URL."},{"name":"data.result.screenshot.width","type":"number","description":"Screenshot width in pixels."}]'::jsonb,
  '{"title":"Website Screenshot","summary":"Capture a screenshot of a website and get its metadata.","description":"Capture a screenshot of a web page and return the screenshot URL together with page metadata. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"url","type":"string","required":true,"description":"Website URL to capture","location":"query","example":"https://example.com"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"title":"Example Domain","description":"Example description","url":"https://example.com","publisher":"example.com","lang":"en","screenshot":{"url":"https://example.com/screenshot.png","type":"png","size":120000,"height":720,"width":1280,"size_pretty":"120 kB"}}}},"responseSchema":[{"name":"data.result.title","type":"string","description":"Page title."},{"name":"data.result.description","type":"string","description":"Page description."},{"name":"data.result.url","type":"string","description":"Final page URL."},{"name":"data.result.screenshot.url","type":"string","description":"Screenshot image URL."},{"name":"data.result.screenshot.width","type":"number","description":"Screenshot width in pixels."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 300, '{"windowSeconds":60,"max":10}'::jsonb, 104
),
(
  '71454ed4-bcd1-563e-a399-fde2bba472fa',
  (select id from public.categories where slug = 'tools'),
  'Image to Text (OCR)', 'tools-ocr', '/api/v1/tools/ocr', 'GET',
  'Extract text from an image.',
  'legacy-default-v1', null, 'provider', 'legacy-query-tools-ocr',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"data.result.text","type":"string","description":"Recognized text."},{"name":"data.result.detail","type":"array","description":"Detailed recognition data."}]'::jsonb,
  '{"title":"Image to Text (OCR)","summary":"Extract text from an image.","description":"Read the text inside an image using optical character recognition. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"text":"Recognized text","detail":[]}}},"responseSchema":[{"name":"data.result.text","type":"string","description":"Recognized text."},{"name":"data.result.detail","type":"array","description":"Detailed recognition data."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 300, '{"windowSeconds":60,"max":20}'::jsonb, 105
),
(
  '0ed166c2-99aa-5b12-9e23-4986986fd2cd',
  (select id from public.categories where slug = 'tools'),
  'NSFW Checker', 'tools-nsfw-checker', '/api/v1/tools/nsfw-checker', 'GET',
  'Check whether an image contains adult content.',
  'legacy-default-v1', null, 'provider', 'legacy-query-tools-nsfw-checker',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"data.result.label_name","type":"string","description":"Predicted label."},{"name":"data.result.confidence","type":"number","description":"Confidence score from 0 to 1."},{"name":"data.result.label_id","type":"string","description":"Label ID."}]'::jsonb,
  '{"title":"NSFW Checker","summary":"Check whether an image contains adult content.","description":"Classify an image and return the predicted label with a confidence score. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"label_name":"normal","confidence":0.98,"label_id":"0"}}},"responseSchema":[{"name":"data.result.label_name","type":"string","description":"Predicted label."},{"name":"data.result.confidence","type":"number","description":"Confidence score from 0 to 1."},{"name":"data.result.label_id","type":"string","description":"Label ID."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 300, '{"windowSeconds":60,"max":20}'::jsonb, 106
),
(
  'cd824a8d-cce7-5b6b-8d9c-93b388e5b8c8',
  (select id from public.categories where slug = 'tools'),
  'Remove Background', 'tools-removebg', '/api/v1/tools/removebg', 'GET',
  'Remove the background from an image.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-tools-removebg',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Remove Background","summary":"Remove the background from an image.","description":"Remove the background from an image and return the result as a transparent image. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 107
),
(
  'cd4ec347-b48d-5d0f-bd47-4035ad34c32e',
  (select id from public.categories where slug = 'tools'),
  'Image Enhancer (Remini)', 'tools-remini', '/api/v1/tools/remini', 'GET',
  'Enhance and upscale an image.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-tools-remini',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Image Enhancer (Remini)","summary":"Enhance and upscale an image.","description":"Enhance the quality and sharpness of an image. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 108
),
(
  'f588a70a-d8eb-547a-bfb4-b6f2a095e3e8',
  (select id from public.categories where slug = 'tools'),
  'Blur Face', 'tools-blurface', '/api/v1/tools/blurface', 'GET',
  'Blur the faces in an image.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-tools-blurface',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Blur Face","summary":"Blur the faces in an image.","description":"Detect faces in an image and blur them. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 109
),
(
  'd75e99e9-0546-5900-9bd9-5b8ddc406754',
  (select id from public.categories where slug = 'tools'),
  'Remove Watermark', 'tools-dewatermark', '/api/v1/tools/dewatermark', 'GET',
  'Remove a watermark from an image.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-tools-dewatermark',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Remove Watermark","summary":"Remove a watermark from an image.","description":"Remove a watermark from an image. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 110
),
(
  'd642a2a4-8425-56bf-a7ff-94969ab25f42',
  (select id from public.categories where slug = 'news'),
  'Free Fire News', 'news-ffnews', '/api/v1/news/ffnews', 'GET',
  'Latest Free Fire news articles.',
  'legacy-default-v1', null, 'provider', 'legacy-query-news-ffnews',
  '[]'::jsonb,
  '[{"name":"data.result.total","type":"number","description":"Number of articles."},{"name":"data.result.data","type":"array","description":"List of articles."},{"name":"data.result.data[].title","type":"string","description":"Article title."},{"name":"data.result.data[].date","type":"string","description":"Publish date."},{"name":"data.result.data[].link","type":"string","description":"Article URL."}]'::jsonb,
  '{"title":"Free Fire News","summary":"Latest Free Fire news articles.","description":"Returns the latest Free Fire news articles with title, date and link. Provider responses are normalized into the Kyyinfinite response envelope; provider details are never exposed.","params":[],"headers":[],"requestExample":null,"responseExample":{"status":"success","code":200,"message":"Request completed successfully","data":{"status":true,"creator":"Kyyinfinite","result":{"total":10,"data":[{"title":"Article title","date":"2026-11-14","link":"https://example.com/article"}]}}},"responseSchema":[{"name":"data.result.total","type":"number","description":"Number of articles."},{"name":"data.result.data","type":"array","description":"List of articles."},{"name":"data.result.data[].title","type":"string","description":"Article title."},{"name":"data.result.data[].date","type":"string","description":"Publish date."},{"name":"data.result.data[].link","type":"string","description":"Article URL."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 300, '{"windowSeconds":60,"max":30}'::jsonb, 111
),
(
  'd546a5e6-31ea-541e-a4b3-5b1230ce778c',
  (select id from public.categories where slug = 'maker'),
  'Gura Canvas', 'maker-gura', '/api/v1/maker/gura', 'GET',
  'Put your image into a Gura-style canvas.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-maker-gura',
  '[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Gura Canvas","summary":"Put your image into a Gura-style canvas.","description":"Generate a canvas image featuring your picture. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"url","type":"string","required":true,"description":"Direct image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 112
),
(
  'a6a7eec1-85cf-580e-aaf5-0eb10b6c8c66',
  (select id from public.categories where slug = 'maker'),
  'Music Card', 'maker-musiccard', '/api/v1/maker/musiccard', 'GET',
  'Create a music card image.',
  null, 'legacy-provider-stream', 'stream', 'legacy-query-maker-musiccard',
  '[{"name":"judul","type":"string","required":true,"description":"Song title shown on the card","location":"query","example":"Lemonade"},{"name":"nama","type":"string","required":true,"description":"Name shown on the card","location":"query","example":"Your Name"},{"name":"image_url","type":"string","required":true,"description":"Direct cover image URL","location":"query","example":"https://example.com/image.jpg"}]'::jsonb,
  '[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}]'::jsonb,
  '{"title":"Music Card","summary":"Create a music card image.","description":"Generate a music player card image with a song title, a name and a cover image. The response is the raw image file with its original content type, not a JSON envelope.","params":[{"name":"judul","type":"string","required":true,"description":"Song title shown on the card","location":"query","example":"Lemonade"},{"name":"nama","type":"string","required":true,"description":"Name shown on the card","location":"query","example":"Your Name"},{"name":"image_url","type":"string","required":true,"description":"Direct cover image URL","location":"query","example":"https://example.com/image.jpg"}],"headers":[],"requestExample":null,"responseExample":{"status":"binary","message":"Returns raw file bytes with the upstream content type; no JSON envelope."},"responseSchema":[{"name":"(binary)","type":"file","description":"Raw file bytes with the upstream content type."}],"errorCodes":[{"code":400,"name":"INVALID_PARAMS","description":"One or more query parameters are missing or invalid."},{"code":429,"name":"RATE_LIMITED","description":"Too many requests in the current window."},{"code":502,"name":"UPSTREAM_ERROR","description":"The upstream service returned an invalid response."},{"code":504,"name":"UPSTREAM_TIMEOUT","description":"The upstream service took too long to respond."},{"code":500,"name":"INTERNAL_ERROR","description":"An unexpected platform error occurred."}]}'::jsonb,
  true, 'active', 0, '{"windowSeconds":60,"max":10}'::jsonb, 113
)
on conflict (slug) do update set
  category_id = excluded.category_id, name = excluded.name,
  public_path = excluded.public_path, method = excluded.method,
  description = excluded.description, normalizer_id = excluded.normalizer_id,
  handler_id = excluded.handler_id, kind = excluded.kind,
  param_schema_id = excluded.param_schema_id, request_schema = excluded.request_schema,
  response_schema = excluded.response_schema, docs = excluded.docs,
  is_active = true, lifecycle = 'active', cache_ttl = excluded.cache_ttl,
  rate_limit = excluded.rate_limit, sort_order = excluded.sort_order;

insert into public.endpoint_provider_mappings (endpoint_id, provider_id, provider_path, priority, configuration, is_active)
values
  ((select id from public.api_endpoints where slug = 'ai-gita'), (select id from public.providers where internal_name = 'legacy-siputzx'), '/api/ai/gita', 1, '{"paramsMap":{"q":"q"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'ai-bibleai'), (select id from public.providers where internal_name = 'legacy-siputzx'), '/api/ai/bibleai', 1, '{"paramsMap":{"question":"question","translation":"translation"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'ai-powerbrain'), (select id from public.providers where internal_name = 'legacy-nexray'), '/ai/powerbrain', 1, '{"paramsMap":{"text":"text"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'random-quotesanime'), (select id from public.providers where internal_name = 'legacy-siputzx'), '/api/r/quotesanime', 1, '{"paramsMap":{}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'random-lahelu'), (select id from public.providers where internal_name = 'legacy-siputzx'), '/api/r/lahelu', 1, '{"paramsMap":{}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-yt-transcribe'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/yt-transcribe', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-ssweb'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/ssweb', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-ocr'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/ocr', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-nsfw-checker'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/nsfw-checker', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-removebg'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/removebg', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-remini'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/remini', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-blurface'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/blurface', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'tools-dewatermark'), (select id from public.providers where internal_name = 'legacy-nexray'), '/tools/v1/dewatermark', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'news-ffnews'), (select id from public.providers where internal_name = 'legacy-nexray'), '/berita/ffnews', 1, '{"paramsMap":{}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'maker-gura'), (select id from public.providers where internal_name = 'legacy-nexray'), '/canvas/gura', 1, '{"paramsMap":{"url":"url"}}'::jsonb, true),
  ((select id from public.api_endpoints where slug = 'maker-musiccard'), (select id from public.providers where internal_name = 'legacy-nexray'), '/canvas/musiccard', 1, '{"paramsMap":{"judul":"judul","nama":"nama","image_url":"image_url"}}'::jsonb, true)
on conflict (endpoint_id, provider_id) do update set
  provider_path = excluded.provider_path,
  configuration = excluded.configuration,
  is_active = true;

commit;
