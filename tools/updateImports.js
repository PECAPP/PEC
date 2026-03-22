import fs from 'fs';
import path from 'path';

const rootDir = 'c:\\Users\\dubey\\omnifow\\src';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file))) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(rootDir);

const replacements = [
    { from: /@\/hooks\/useAuth/g, to: '@/features/auth/hooks/useAuth' },
    { from: /@\/lib\/rolePermissions/g, to: '@/features/auth/lib/rolePermissions' },
    { from: /import\("\.\/pages\/AuthEnhanced"\)/g, to: 'import("@/features/auth/pages/AuthPage")' },
    { from: /import\("\.\/pages\/RoleSelection"\)/g, to: 'import("@/features/auth/pages/RoleSelection")' },
    { from: /import\("\.\/pages\/Onboarding"\)/g, to: 'import("@/features/auth/pages/Onboarding")' },
    { from: /import\("\.\/pages\/Courses"\)/g, to: 'import("@/features/courses/pages/CoursesPage")' },
    { from: /import\("\.\/pages\/CourseDetail"\)/g, to: 'import("@/features/courses/pages/CourseDetailPage")' },
    { from: /import\("\.\/pages\/college\/AddCourse"\)/g, to: 'import("@/features/courses/pages/AddCoursePage")' },
    { from: /import\("\.\/pages\/CourseMaterials"\)/g, to: 'import("@/features/courses/pages/CourseMaterialsPage")' }
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    replacements.forEach(r => {
        if (r.from.test(content)) {
            content = content.replace(r.from, r.to);
            changed = true;
        }
    });
    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated imports in: ${file}`);
    }
});
