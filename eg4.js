const express=require('express');
const oracle=require('oracledb');
const port=5050;
const bodyParser=require('body-parser');
const app=express();
const urlEncodedBodyParser=bodyParser.urlencoded({ extended : false });
app.use(express.static("test"));
const timeDelay=(ms)=>{
    return new Promise((resolve)=>{
        setTimeout(resolve,ms);
    });
}
app.get("/",function(request,response){
    response.send("index.html");
});

class Department {
    constructor(id,name) {
        this.id=id;
        this.name=name;
    }
}
class Employee {
    constructor(id,firstName,lastName) {
        this.id=id;
        this.firstName=firstName;
        this.lastName=lastName;
    }
    getId() {
        return this.id;
    }
    getFirstName() {
        return this.firstName;
    }
    getLastName() {
        return this.lastName;
    }
}
app.get("/students",async function(request,response){
    var connection=null;
    connection=await oracle.getConnection({
        "user" : "hr",
        "password" : "hr",
        "connectionString" : "localhost:1521/xepdb1"
    });
var resultSet=await connection.execute("select employee_id,first_name from employees");
    var i,employee,id,firstName;
    var employees=[];
    while(i<resultSet.rows.length) {
        id=resultSet.rows[i][0];
        firstName=resultSet.rows[i][1];
        employee=new Employee(id,firstName);
        employees.push(employee);
        i++;
    }
    response.send(employees);
    await connection.close();
});
app.get("/getDepartments",async function(request,response){
    var connection=null;
    connection=await oracle.getConnection({
        "user" : "hr",
        "password" : "hr",
        "connectionString" : "localhost:1521/xepdb1"
    });
    var resultSet=await connection.execute("select department_id,department_name from departments order by department_name");
    var i,department,id,name;
    var departments=[];
    i=0;
    while(i<resultSet.rows.length) {
        id=resultSet.rows[i][0];
        name=resultSet.rows[i][1];
        department=new Department(id,name);
        departments.push(department);
        i++;
    }
    await connection.close();
    response.send(departments);
});

app.get("/getDepartmentById",urlEncodedBodyParser,async function(request,response){
    await timeDelay(5000);
    var connection=null;
    connection=await oracle.getConnection({
        "user" : "hr",
        "password" : "hr",
        "connectionString" : "localhost:1521/xepdb1"
    });
    var departmentId=parseInt(request.query.departmentId);
    var resultSet=await connection.execute(`select employee_id,first_name,last_name from employees where department_id=${departmentId} order by first_name`);
    if(resultSet.rows.length==0) {
        await connection.close();
        response.send([]);
        return;
    }
    var i,employee,id,firstName,lastName;
    var employees=[];
    i=0;
    while(i<resultSet.rows.length)
    {
        id=resultSet.rows[i][0];
        firstName=resultSet.rows[i][1];
        lastName=resultSet.rows[i][2];
        employee=new Employee(id,firstName,lastName);
        employees.push(employee);
        i++;
    }
    await connection.close();
    response.send(employees);
});
class EmployeeDetails{
    constructor(id,email,salary,managerId,departmentId){
        this.id=id;
        this.email=email;
        this.salary=salary;
        this.departmentId=departmentId;
        this.managerId=managerId;
    }
    getId() {
        return this.id;
    }
    getEmail() {
        return this.email;
    }
    getSalary() {
        return this.salary;
    }
    getDepartmentId() {
        return this.departmentId;
    }
    getManagerId() {
        return this.managerId;
    }
}
app.get("/getEmployeeDetails",urlEncodedBodyParser,async function(request,response){
    await timeDelay(5000);
    var connection=null;
    connection=await oracle.getConnection({
        "user" : "hr",
        "password" : "hr",
        "connectionString" : "localhost:1521/xepdb1"
    });
    var employeeId=parseInt(request.query.employeeId)
    var employeeDetails;
    var resultSet=await connection.execute(`select email,salary,department_id,manager_id from employees where employee_id=${employeeId}`);
    if(resultSet.rows.length==0) {
        employeeDetails=new EmployeeDetails(employeeId,"",0,0,0);
        response.send(employeeDetails);
        return;
    }
    employeeDetails=new EmployeeDetails(resultSet.rows[0][0],resultSet.rows[0][1],resultSet.rows[0][2],resultSet.rows[0][3]);
    await connection.close();
    response.send(employeeDetails);
});

app.listen(port,function(err){
    if(err) {
        console.log(err);
    }
    console.log('server is ready to pair on port 5050 ');
});