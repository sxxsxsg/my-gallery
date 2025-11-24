// functions/api/upload.js

// --- CORS 通行规则 (代码重复但为了独立性) ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// --- 响应工具 ---
const respond = (data, status = 200) => new Response(JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
  status,
});
const respondError = (message, status = 400) => respond({ error: message }, status);

// --- JWT 验证函数 ---
async function validateToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const [username, timestamp] = token.split(':');
  if (!username || !timestamp) return null;
  const tokenCreationTime = parseInt(timestamp, 10);
  if (Date.now() - tokenCreationTime > 24 * 60 * 60 * 1000) return null;
  return { username };
}

// --- 处理 POST 请求的函数 ---
export async function onRequestPost(context) {
    const { request, env } = context;

    const user = await validateToken(request, env);
    if (!user) {
      return respondError('未经授权，请先登录', 401);
    }
    if (!env.GALLERY_BUCKET) {
      return respondError('R2 存储桶未绑定', 500);
    }
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return respondError('未找到文件', 400);
      }
      const fileExtension = file.name.split('.').pop() || 'dat';
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
      
      await env.GALLERY_BUCKET.put(uniqueFileName, await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      });
      
      return respond({
        message: '文件上传成功!',
        fileName: uniqueFileName,
      });
    } catch (error) {
      console.error('上传失败:', error);
      return respondError(`上传处理失败: ${error.message}`, 500);
    }
}

// --- 处理 OPTIONS "侦察兵" 请求的函数 ---
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
