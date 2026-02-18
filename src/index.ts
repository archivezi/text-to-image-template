export default {
	async fetch(request, env) {
		// برای صفحه اصلی، HTML رو نشون بده
		if (request.method === "GET") {
			const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>آرشیوزی - تولید تصویر</title>
    <style>
        body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: #1a1a1a; color: white; }
        textarea { width: 100%; height: 100px; background: #333; color: white; border: 1px solid #444; padding: 10px; border-radius: 5px; }
        button { background: #ffd700; color: black; padding: 10px 30px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; margin: 10px; }
        img { max-width: 100%; border-radius: 10px; margin-top: 20px; }
        #loading { display: none; margin: 20px; color: #ffd700; }
    </style>
</head>
<body>
    <h1>🎨 آرشیوزی</h1>
    <p>با هوش مصنوعی تصویر بسازید</p>
    
    <textarea id="prompt" placeholder="پرامپت خود را وارد کنید...">a beautiful iranian girl flying in the sky</textarea>
    <br>
    <button onclick="generate()">تولید تصویر</button>
    
    <div id="loading">در حال تولید تصویر (حدود 10 ثانیه)...</div>
    <img id="result" style="display:none;">

    <script>
        async function generate() {
            const prompt = document.getElementById('prompt').value;
            
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            try {
                // ارسال پرامپت به همون آدرس
                const res = await fetch('/', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({prompt})
                });
                
                if (!res.ok) throw new Error('خطا در تولید');
                
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                
                document.getElementById('result').src = url;
                document.getElementById('result').style.display = 'block';
                
            } catch (e) {
                alert('خطا: ' + e.message);
            }
            
            document.getElementById('loading').style.display = 'none';
        }
    </script>
</body>
</html>`;
			
			return new Response(html, {
				headers: { "Content-Type": "text/html" }
			});
		}
		
		// برای درخواست POST (تولید تصویر)
		if (request.method === "POST") {
			try {
				// دریافت پرامپت از بدنه درخواست
				const { prompt } = await request.json();
				
				// تولید تصویر با پرامپتی که کاربر داده
				const response = await env.AI.run(
					"@cf/stabilityai/stable-diffusion-xl-base-1.0",
					{ prompt }
				);
				
				// برگردوندن تصویر
				return new Response(response, {
					headers: { "Content-Type": "image/png" }
				});
				
			} catch (e) {
				return new Response(JSON.stringify({ error: e.message }), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
		}
		
		return new Response("Not Found", { status: 404 });
	}
} satisfies ExportedHandler<Env>;
