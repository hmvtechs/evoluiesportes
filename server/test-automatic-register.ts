import axios from 'axios';

const generateRandomUser = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);

    // Generate valid CPF (simplified for test - just needs 11 digits)
    // In a real scenario we might need a valid algorithm if the server validates checksums strictly.
    // The server uses `cpfValidationService` which calls an API. 
    // Wait, the server code I saw earlier:
    // `const { identifier, password } = req.body;` in login
    // In register: `const { email, cpf, ... } = req.body;`
    // And it calls `supabase.auth.signUp`.
    // It does NOT seem to call `validateRF` strictly blocking registration in the controller code I saw (it was commented out or separate).
    // Let's check `userController.ts` again if I can... 
    // Actually, looking at previous file views:
    // `const { data: newUser, error: createError } = await supabase.from('User').insert({...})`
    // It cleans CPF: `const cleanCpf = cpf.replace(/\D/g, '');`
    // It doesn't seem to enforce strict CPF validation logic *before* insert in the controller snippet I saw, 
    // but the database might have constraints or triggers.
    // Let's try to generate a "valid-looking" CPF just in case, or just random 11 digits.
    // The previous manual test used "12345678901", "12345678902".

    const cpfBase = timestamp.toString().slice(-9) + randomNum.toString().slice(-2);
    const cpf = cpfBase.padEnd(11, '0');

    return {
        email: `auto_test_${timestamp}_${randomNum}@example.com`,
        cpf: cpf,
        password: "password123",
        full_name: `Auto Test User ${timestamp}`,
        phone: "11999999999",
        sex: "M",
        birth_date: "1990-01-01",
        city: "Test City",
        state: "TS",
        role: "FAN"
    };
};

const runTest = async () => {
    const user = generateRandomUser();
    console.log('🤖 Starting Automatic User Registration Test');
    console.log('-------------------------------------------');
    console.log('Generated User Data:');
    console.log(`Email: ${user.email}`);
    console.log(`CPF: ${user.cpf}`);
    console.log(`Name: ${user.full_name}`);
    console.log('-------------------------------------------');

    try {
        console.log('POST http://localhost:3000/api/v1/users ...');
        const response = await axios.post('http://localhost:3000/api/v1/users', user);

        console.log('\n✅ SUCCESS!');
        console.log('Status:', response.status, response.statusText);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error: any) {
        console.log('\n❌ FAILED');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error:', error.message);
        }
    }
};

runTest();
