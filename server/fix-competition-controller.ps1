# Script para consertar competitionController.ts
# Remove Promise.all lento e simplifica listCompetitions

$file = "src/controllers/competitionController.ts"
$backup = "src/controllers/competitionController.ts.backup"

Write-Host "🔧 Consertando competitionController.ts..." -ForegroundColor Cyan

# 1. Fazer backup
Write-Host "📦 Criando backup..."
Copy-Item $file $backup -Force

# 2. Tentar restaurar do git primeiro
Write-Host "🔄 Tentando restaurar do git..."
git checkout HEAD -- $file 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Arquivo restaurado do git" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git restore falhou, usando backup" -ForegroundColor Yellow
}

# 3. Ler o arquivo
$content = Get-Content $file -Raw

# 4. Encontrar e substituir a função listCompetitions
$oldFunction = @'
export const listCompetitions = async \(req: Request, res: Response\) => \{[\s\S]*?^\};
'@

$newFunction = @'
export const listCompetitions = async (req: Request, res: Response) => {
    console.log('🔵 [listCompetitions] Request received');
    try {
        console.log('🟢 [listCompetitions] Querying Supabase...');
        const { data: competitions, error } = await supabase
            .from('Competition')
            .select('id, name, status, nickname, start_date, end_date, modality:Modality(id, name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('🔴 [listCompetitions] Supabase error:', error);
            throw error;
        }
        
        console.log(`✅ [listCompetitions] Got ${competitions?.length || 0} competitions`);
        
        // Simplificado: retornar direto sem counts (era muito lento)
        const result = (competitions || []).map(comp => ({
            ...comp,
            _count: { registrations: 0, matches: 0 }
        }));
        
        console.log('📤 [listCompetitions] Sending ${result.length} competitions...');
        res.status(200).json(result);
        console.log('✅ [listCompetitions] Response sent');
    } catch (error: any) {
        console.error('🔴 [listCompetitions] FATAL ERROR:', error.message);
        res.status(500).json({ error: 'Failed to list competitions' });
    }
};
'@

# 5. Substituir usando regex
$newContent = $content -replace $oldFunction, $newFunction

# 6. Salvar
$newContent | Set-Content $file -NoNewline

Write-Host "✅ Arquivo consertado!" -ForegroundColor Green
Write-Host "📍 Backup salvo em: $backup" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Verificando sintaxe TypeScript..." -ForegroundColor Cyan

# 7. Verificar se tem erros de sintaxe
npx tsc --noEmit $file 2>&1 | Select-Object -First 10

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sintaxe OK!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Possíveis erros de sintaxe (verifique acima)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Pronto! Agora reinicie o servidor:" -ForegroundColor Green
Write-Host "   npx ts-node src/app.ts" -ForegroundColor White
