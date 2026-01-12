import fs from 'fs';
import path from 'path';
import { CineVideoSchema } from '../remotion/schema';

async function validate() {
    const requestsDir = path.join(process.cwd(), 'requests');

    if (!fs.existsSync(requestsDir)) {
        console.log('Requests directory does not exist. Skipping validation.');
        return;
    }

    const files = fs.readdirSync(requestsDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        console.log('No JSON files found in requests/ to validate.');
        return;
    }

    let hasError = false;

    for (const file of files) {
        const filePath = path.join(requestsDir, file);
        console.log(`Validating: ${file}...`);
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);

            const result = CineVideoSchema.safeParse(json);

            if (!result.success) {
                console.error(`❌ Validation failed for ${file}:`);
                // Daha oxunaqlı xəta mesajları
                result.error.issues.forEach(issue => {
                    console.error(`  - [Path: ${issue.path.join('.') || 'root'}]: ${issue.message}`);
                });
                hasError = true;
            } else {
                console.log(`✅ ${file} is valid.`);
            }
        } catch (e: any) {
            console.error(`❌ Error reading or parsing ${file}:`, e.message);
            hasError = true;
        }
    }

    if (hasError) {
        console.error('\nJSON validasiyası uğursuz oldu! Xətaları düzəldib yenidən Push edin.');
        process.exit(1);
    } else {
        console.log('\nBütün JSON faylları uğurla yoxlanıldı. 🚀');
    }
}

validate().catch(err => {
    console.error('Validation script failed:', err);
    process.exit(1);
});
