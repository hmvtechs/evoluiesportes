$envContent = Get-Content .env
$keyLine = $envContent | Select-String "SUPABASE_ANON_KEY"
$key = $keyLine.ToString().Split('=')[1].Trim()

$url = "https://deqtlplceaphtindxxtu.supabase.co/auth/v1/signup"
$ip = "104.18.38.146"

Write-Host "Testing Signup with Key: $key"

# Use curl with --resolve
# Note: Windows curl might be alias to Invoke-WebRequest, so we use curl.exe if available or just invoke-webrequest
# But --resolve is specific to curl.

$body = '{"email":"curltest@example.com","password":"password123"}'

# Construct the command
# We use the IP in the URL and Host header to simulate --resolve if curl is not available or old
# But --resolve is best.

curl.exe --resolve deqtlplceaphtindxxtu.supabase.co:443:104.18.38.146 -X POST $url -H "apikey: $key" -H "Content-Type: application/json" -d $body -v
