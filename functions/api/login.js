// functions/api/login.js

// --- CORS 通行规则 ---
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

// --- 处理 POST 请求的函数 ---
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { username, password } = await request.json();
    if (username === env.ADMIN_USER && password === env.ADMIN_PASS) {
      const token = `${username}:${Date.now()}`;
      return respond({ 
        message: 'Login successful',
        token,
        user: { username }
      });
    }
    return respondError('用户名或密码错误', 401);
  } catch (e) {
    return respondError('请求格式错误', 400);
  }
}

// --- 处理 OPTIONS "侦察兵" 请求的函数 ---
export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}
