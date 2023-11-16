<template>
    <div>
        <el-row>
            <el-col :span="24"><h2>Bienvenido</h2></el-col>
        </el-row>
        <el-row class="pt-50">
            <el-col :span="11" :offset="1">
                <el-card shadow="hover"> 
                    <div style="padding: 14px">
                        <span>Inicia sesion</span>
                        <div class="mt-10">
                            <el-form ref="loginForm"
                                :model="loginForm"
                                :rules="loginRules"
                                label-width="120px"
                                status-icon
                                label-position="top"
                            >
                                <el-form-item label="Correo electronico" prop="email">
                                    <el-input v-model="loginForm.email" clearable></el-input>
                                </el-form-item>
                                <el-form-item label="Contraseña" prop="password">
                                    <el-input type="password" v-model="loginForm.password" show-password></el-input>
                                </el-form-item>
                                <el-form-item label="Recuerdame" prop="remember">
                                    <el-checkbox v-model="loginForm.remember">Recordar Sesion</el-checkbox>
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitForm('loginForm')">Submit</el-button>
                                    <el-button @click="resetForm('loginForm')">Reset</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="11" >
                <el-card shadow="hover"> 
                    <div style="padding: 14px">
                        <!-- <el-form-item label="Password" prop="pass">
                            <el-input type="password" v-model="ruleForm.pass" autocomplete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="Confirm" prop="checkPass">
                            <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off"></el-input>
                        </el-form-item> -->
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import store from "~/store";
export default {
    data() {
        var validatePass = (rule, value, callback) => {
            // if (value === '') {
            // callback(new Error('Please input the password'));
            // } else {
            // if (this.loginForm.checkPass !== '') {
            //     this.$refs.loginForm.validateField('checkPass');
            // }
            // callback();
            // }
        };
        return {
            loginForm: {
                email: '',
                password: '',
                remember: false
            },
            loginRules: {
                email: [
                    {required: true, message: "Correo electronico es requerido", trigger: 'blur'},
                    {type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change']}
                ],
                password: [
                    {required: true, message: "Ingresa tu contraseña", trigger: 'blur'},
                    {min: 3, message: "Debe contener minimo 8 caracteres", trigger: 'blur'}
                ]
            }
        }
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
            if (valid) {
                store
                .dispatch("login", this.loginForm)
                    .then(() => {
                    // loading.value = false;
                    this.$router.push({
                        name: "Dashboard",
                    });
                    })
                    .catch((err) => {
                    // loading.value = false;
                    // errorMsg.value = err.response.data.error;
                });
            } else {
                console.log('error submit!!');
                return false;
            }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        }
    }
}
</script>