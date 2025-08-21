// Centralized default values for all tools
// This makes it easy to manage and modify default content across all tools

export const toolDefaults = {
  // Formatters
  json: `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zipCode":"10001"}}`,

  jsonc: `{
  // Application configuration
  "name": "my-awesome-app",
  "version": "1.0.0",
  /* Multi-line comment
     for detailed descriptions */
  "description": "A sample JSONC configuration file",
  "main": "index.js",
  "scripts": {
    // Development scripts
    "start": "node index.js",
    "dev": "nodemon index.js", // Hot reload for development
    "test": "jest",
    "build": "webpack --mode=production"
  },
  "dependencies": {
    "express": "^4.18.0", // Web framework
    "cors": "^2.8.5", // Cross-origin resource sharing
    "helmet": "^6.0.0" // Security middleware
  },
  "devDependencies": {
    "nodemon": "^2.0.20", // Development auto-restart
    "jest": "^29.0.0", // Testing framework
    "webpack": "^5.74.0" // Module bundler
  },
  // Environment configuration
  "config": {
    "port": 3000,
    "database": {
      "host": "localhost",
      "name": "myapp_db", // Database name
      "user": "admin"
    },
    "features": {
      "enableLogging": true, // Enable application logging
      "enableMetrics": false, // Disable metrics collection for now
      "apiRateLimit": 100 // Requests per minute
    }
  }
}`,

  html: `<!DOCTYPE html><html><head><title>Sample Page</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><header><h1>Welcome to My Website</h1><nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul></nav></header><main><section id="hero"><h2>Hero Section</h2><p>This is a sample HTML document for formatting.</p><button type="button">Call to Action</button></section><article><h3>Article Title</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong>Bold text</strong> and <em>italic text</em> for emphasis.</p><blockquote>This is a quote that spans multiple lines and contains important information.</blockquote></article></main><footer><p>&copy; 2024 My Website. All rights reserved.</p></footer></body></html>`,

  yaml: `# Application Configuration
app:
  name: "my-awesome-app"
  version: "1.0.0"
  description: "A sample YAML configuration file"
  port: 3000
  
database:
  host: "localhost"
  port: 5432
  name: "myapp_db"
  user: "admin"
  ssl: true
  pool:
    min: 2
    max: 10
    
features:
  logging:
    enabled: true
    level: "info"
    file: "/var/log/app.log"
  metrics:
    enabled: false
    endpoint: "/metrics"
  rate_limiting:
    requests_per_minute: 100
    
dependencies:
  - name: "express"
    version: "^4.18.0"
  - name: "cors" 
    version: "^2.8.5"
  - name: "helmet"
    version: "^6.0.0"`,

  markdown: `# Sample Markdown Document

This is a **comprehensive example** of Markdown formatting that demonstrates various elements and syntax.

## Table of Contents
- [Headers](#headers)
- [Text Formatting](#text-formatting)
- [Lists](#lists)
- [Links and Images](#links-and-images)
- [Code](#code)
- [Tables](#tables)

## Headers

### This is an H3
#### This is an H4
##### This is an H5

## Text Formatting

Here's some *italic text* and some **bold text**. You can also use ~~strikethrough~~.

> This is a blockquote. It can span multiple lines and is useful for highlighting important information or quotes from other sources.

## Lists

### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List
1. First step
2. Second step
3. Third step

## Links and Images

[This is a link](https://example.com)

![Alt text for image](https://example.com/image.jpg)

## Code

Inline \`code\` looks like this.

\`\`\`javascript
// Code block example
function greetUser(name) {
  return \`Hello, \${name}!\`;
}

const message = greetUser("World");
console.log(message);
\`\`\`

## Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Value 1  |
| Row 2    | Data 2   | Value 2  |
| Row 3    | Data 3   | Value 3  |

---

*This document demonstrates various Markdown elements for formatting and presentation.*`,

  css: `/* Modern CSS Stylesheet Example */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --accent-color: #e74c3c;
  --text-color: #333;
  --background-color: #fff;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--background-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem 0;
  text-align: center;
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  .button {
    display: block;
    width: 100%;
    text-align: center;
  }
}`,

  less: `// LESS Stylesheet Example with Variables and Mixins
@primary-color: #3498db;
@secondary-color: #2ecc71;
@accent-color: #e74c3c;
@font-size-base: 16px;
@font-size-large: @font-size-base * 1.25;
@border-radius: 8px;

// Mixins
.border-radius(@radius: @border-radius) {
  border-radius: @radius;
  -webkit-border-radius: @radius;
  -moz-border-radius: @radius;
}

.box-shadow(@x: 0, @y: 2px, @blur: 10px, @color: rgba(0,0,0,0.1)) {
  box-shadow: @x @y @blur @color;
  -webkit-box-shadow: @x @y @blur @color;
  -moz-box-shadow: @x @y @blur @color;
}

.transition(@property: all, @duration: 0.3s, @timing: ease) {
  transition: @property @duration @timing;
  -webkit-transition: @property @duration @timing;
  -moz-transition: @property @duration @timing;
}

// Base styles
body {
  font-size: @font-size-base;
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: @primary-color;
  color: white;
  text-decoration: none;
  .border-radius();
  .transition();
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: darken(@primary-color, 10%);
    .box-shadow();
    transform: translateY(-2px);
  }
  
  &.secondary {
    background-color: @secondary-color;
    
    &:hover {
      background-color: darken(@secondary-color, 10%);
    }
  }
}

.card {
  background: white;
  .border-radius();
  .box-shadow();
  padding: 20px;
  margin-bottom: 20px;
  
  .title {
    font-size: @font-size-large;
    font-weight: bold;
    color: @primary-color;
    margin-bottom: 10px;
  }
}`,

  scss: `// SCSS Stylesheet Example with Variables, Mixins, and Nesting
$primary-color: #3498db;
$secondary-color: #2ecc71;
$accent-color: #e74c3c;
$font-size-base: 16px;
$font-size-large: $font-size-base * 1.25;
$border-radius: 8px;
$breakpoint-mobile: 768px;

// Mixins
@mixin border-radius($radius: $border-radius) {
  border-radius: $radius;
  -webkit-border-radius: $radius;
  -moz-border-radius: $radius;
}

@mixin box-shadow($x: 0, $y: 2px, $blur: 10px, $color: rgba(0,0,0,0.1)) {
  box-shadow: $x $y $blur $color;
  -webkit-box-shadow: $x $y $blur $color;
  -moz-box-shadow: $x $y $blur $color;
}

@mixin transition($property: all, $duration: 0.3s, $timing: ease) {
  transition: $property $duration $timing;
  -webkit-transition: $property $duration $timing;
  -moz-transition: $property $duration $timing;
}

@mixin respond-to($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: $breakpoint-mobile) {
      @content;
    }
  }
}

// Base styles
body {
  font-size: $font-size-base;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @include respond-to(mobile) {
    padding: 0 15px;
  }
}

.button {
  display: inline-block;
  padding: 12px 24px;
  background-color: $primary-color;
  color: white;
  text-decoration: none;
  @include border-radius();
  @include transition();
  border: none;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: darken($primary-color, 10%);
    @include box-shadow();
    transform: translateY(-2px);
  }
  
  &.secondary {
    background-color: $secondary-color;
    
    &:hover {
      background-color: darken($secondary-color, 10%);
    }
  }
  
  &.large {
    padding: 16px 32px;
    font-size: $font-size-large;
  }
  
  @include respond-to(mobile) {
    display: block;
    width: 100%;
    text-align: center;
  }
}

.navigation {
  background-color: white;
  @include box-shadow();
  
  .nav-list {
    list-style: none;
    display: flex;
    gap: 20px;
    
    .nav-item {
      .nav-link {
        color: $primary-color;
        text-decoration: none;
        padding: 10px 15px;
        display: block;
        @include transition(color);
        
        &:hover {
          color: darken($primary-color, 15%);
        }
        
        &.active {
          font-weight: bold;
          color: $accent-color;
        }
      }
    }
    
    @include respond-to(mobile) {
      flex-direction: column;
      gap: 0;
    }
  }
}`,

  typescript: `interface User{name:string;age:number;email?:string;isActive:boolean;}type UserStatus="active"|"inactive"|"pending";class UserManager{private users:User[]=[];constructor(initialUsers:User[]=[]){this.users=initialUsers;}addUser(user:User):void{this.users.push(user);}getActiveUsers():User[]{return this.users.filter(user=>user.isActive);}getUserByName<T extends User>(name:string):T|undefined{return this.users.find(user=>user.name===name)as T|undefined;}}const createUserGreeting=(user:User,status:UserStatus="active"):string=>{const greeting=status==="active"?"Welcome":"Hello";return \`\${greeting} \${user.name}! You are \${user.age} years old.\`;};enum Permission{READ="read",WRITE="write",DELETE="delete"}function hasPermission(userRole:string,required:Permission):boolean{const rolePermissions:{[key:string]:Permission[]}={admin:[Permission.READ,Permission.WRITE,Permission.DELETE],editor:[Permission.READ,Permission.WRITE],viewer:[Permission.READ]};return rolePermissions[userRole]?.includes(required)??false;}`,

  graphql: `type User{id:ID!name:String!email:String!age:Int posts:[Post!]!profile:UserProfile}type Post{id:ID!title:String!content:String!author:User!tags:[String!]!createdAt:String!updatedAt:String comments:[Comment!]!}type Comment{id:ID!content:String!author:User!post:Post!createdAt:String!}type UserProfile{bio:String avatar:String website:String location:String}input CreateUserInput{name:String!email:String!age:Int}input UpdateUserInput{name:String email:String age:Int}type Query{users:[User!]!user(id:ID!):User posts:[Post!]!post(id:ID!):Post searchPosts(query:String!):[Post!]!}type Mutation{createUser(input:CreateUserInput!):User!updateUser(id:ID!,input:UpdateUserInput!):User!deleteUser(id:ID!):Boolean!createPost(title:String!,content:String!,authorId:ID!):Post!}type Subscription{postAdded:Post!commentAdded(postId:ID!):Comment!}schema{query:Query mutation:Mutation subscription:Subscription}`,

  // Converters
  jsonYaml: `{
  "name": "sample-project",
  "version": "1.0.0",
  "description": "A sample project for JSON to YAML conversion",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "webpack": "^5.74.0"
  },
  "keywords": ["sample", "demo", "conversion"],
  "author": "Developer Name",
  "license": "MIT"
}`,

  urlToJson: `https://api.example.com/users?page=1&limit=10&sort=name&order=asc&filter=active&category=premium#section`,

  csvToJson: `name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`,

  // Encoders
  base64: `Hello, World! This is a sample text for Base64 encoding.
It contains multiple lines and various characters: !@#$%^&*()
UTF-8 characters are also supported: 你好, мир, 🌍`,

  urlEncoder: `https://example.com/search?q=hello world&category=tech&date=2024-01-01`,

  // Text Tools
  textDiff: {
    original: `The quick brown fox jumps over the lazy dog.
This is the original text with some content.
It has multiple lines for comparison.
Original line that will be changed.`,
    modified: `The quick brown fox leaps over the lazy dog.
This is the modified text with some content.
It has multiple lines for comparison.
Modified line that has been changed.
This is a new line added to the text.`,
  },

  regexTester: {
    text: `Contact us at support@example.com or sales@company.org
Phone numbers: +1-555-0123, (555) 456-7890
Visit our website: https://www.example.com
Date formats: 2024-01-15, 01/15/2024, Jan 15, 2024`,
    pattern: `\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b`,
  },

  textSort: `apple
banana
cherry
date
elderberry
fig
grape
honeydew
kiwi
lemon`,

  textCounter: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,

  textSplit: `apple,banana,cherry,date,elderberry,fig,grape,honeydew,kiwi,lemon`,

  searchReplace: {
    text: `The quick brown fox jumps over the lazy dog.
The quick brown fox is very agile.
Every quick brown fox should jump daily.`,
    search: `quick brown fox`,
    replace: `swift red wolf`,
  },

  // Generators
  loremGenerator: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,

  passwordGenerator: `MySecureP@ssw0rd123!`,

  qrGenerator: "Visit FreeDevTool.App for more amazing developer tools!",

  barcodeGenerator: "FreeDevTool.App",

  // Hash Tools
  md5: `Hello, World! This is a sample text for MD5 hashing.`,
  bcrypt: `mypassword123`,

  // JWT
  jwt: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,

  // Text diff (fix structure)
  textDiff1: `Hello World
This is line 2
This is line 3
This line will be removed
Common line`,
  textDiff2: `Hello World
This is line 2 modified
This is line 3
New line added here
Common line`,

  // Regex tester
  regexPattern: `\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b`,
  regexText: `Here are some email addresses:
john.doe@example.com
jane_smith123@company.org
test.email+tag@domain.co.uk
invalid.email@
another@valid-domain.net
not-an-email-address
support@website.info`,

  // Date/Time Tools
  dateConverter: `2024-01-15T10:30:00.000Z`,

  timezoneConverter: `2024-01-15 10:30:00`,

  dateTimeDiff: {
    start: `2024-01-01 09:00:00`,
    end: `2024-01-15 17:30:00`,
  },

  // Utility Tools
  unitConverter: `100`,

  numberBaseConverter: `255`,

  colorPaletteGenerator: "#3B82F6",

  // TLS Decoder
  tlsDecoder: `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJAKZYzZYzZYzZMA0GCSqGSIb3DQEBCwUAMBkxFzAVBgNV
BAMMDnNhbXBsZS5leGFtcGxlMB4XDTI0MDEwMTAwMDAwMFoXDTI1MDEwMTAwMDAw
MFowGTEXMBUGA1UEAwwOc2FtcGxlLmV4YW1wbGUwggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQC/Sample/Certificate/Data/Here/This/Is/Just/Example
-----END CERTIFICATE-----`,
};
