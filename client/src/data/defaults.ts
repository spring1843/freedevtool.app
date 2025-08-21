// Centralized default values for all tools
// Each constant is independent for easy tracking and refactoring

// Formatters
export const DEFAULT_JSON = `{"name":"John Doe","age":30,"city":"New York","hobbies":["reading","swimming","coding"],"address":{"street":"123 Main St","zipCode":"10001"}}`;

export const DEFAULT_JSONC = `{
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
}`;

export const DEFAULT_HTML = `<!DOCTYPE html><html><head><title>Sample Page</title><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><header><h1>Welcome to My Website</h1><nav><ul><li><a href="#home">Home</a></li><li><a href="#about">About</a></li><li><a href="#contact">Contact</a></li></ul></nav></header><main><section id="hero"><h2>Hero Section</h2><p>This is a sample HTML document for formatting.</p><button type="button">Call to Action</button></section><article><h3>Article Title</h3><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. <strong>Bold text</strong> and <em>italic text</em> for emphasis.</p><blockquote>This is a quote that spans multiple lines and contains important information.</blockquote></article></main><footer><p>&copy; 2024 My Website. All rights reserved.</p></footer></body></html>`;

export const DEFAULT_YAML = `# Application Configuration
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
    version: "^2.8.5"`;

export const DEFAULT_MARKDOWN = `# Sample Markdown Document

This is a **comprehensive** example of *Markdown* formatting that demonstrates various elements commonly used in documentation and content creation.

## Introduction

Markdown is a lightweight markup language with plain-text formatting syntax. It's designed to be easy to read and write, and it can be converted to HTML and other formats.

## Text Formatting

You can make text **bold** or *italic*, or even ***both***. You can also use ~~strikethrough~~ text and \`inline code\`.

### Lists

#### Unordered List
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List
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

*This document demonstrates various Markdown elements for formatting and presentation.*`;

export const DEFAULT_CSS = `/* Modern CSS Stylesheet Example */
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
  box-shadow: var(--box-shadow);
  transform: translateY(-2px);
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin: 1rem 0;
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  .button {
    display: block;
    width: 100%;
    text-align: center;
  }
}`;

export const DEFAULT_LESS = `// LESS Stylesheet Example with Variables and Mixins
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
}`;

export const DEFAULT_SCSS = `// SCSS Stylesheet Example with Variables, Mixins, and Nesting
$primary-color: #3498db;
$secondary-color: #2ecc71;
$accent-color: #e74c3c;
$font-size-base: 16px;
$font-size-large: $font-size-base * 1.25;
$border-radius: 8px;
$transition-duration: 0.3s;

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

@mixin transition($property: all, $duration: $transition-duration, $timing: ease) {
  transition: $property $duration $timing;
  -webkit-transition: $property $duration $timing;
  -moz-transition: $property $duration $timing;
}

// Base styles
body {
  font-size: $font-size-base;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  &.fluid {
    max-width: 100%;
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
  
  &.outline {
    background-color: transparent;
    border: 2px solid $primary-color;
    color: $primary-color;
    
    &:hover {
      background-color: $primary-color;
      color: white;
    }
  }
}

.card {
  background: white;
  @include border-radius();
  @include box-shadow();
  padding: 20px;
  margin-bottom: 20px;
  
  .title {
    font-size: $font-size-large;
    font-weight: bold;
    color: $primary-color;
    margin-bottom: 10px;
    
    &.center {
      text-align: center;
    }
  }
  
  .content {
    color: #666;
    line-height: 1.7;
    
    p {
      margin-bottom: 15px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// Responsive design
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .button {
    display: block;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }
  
  .card {
    margin-bottom: 15px;
    padding: 15px;
  }
}`;

export const DEFAULT_TYPESCRIPT = `// TypeScript Example with Types, Interfaces, and Classes
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
  roles: string[];
}

interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
  timestamp: Date;
}

type UserRole = 'admin' | 'user' | 'moderator';

class UserService {
  private users: User[] = [];
  
  constructor(private apiUrl: string) {}
  
  async fetchUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(\`\${this.apiUrl}/users/\${id}\`);
      const data = await response.json();
      
      return {
        data,
        message: 'User fetched successfully',
        status: 'success',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        data: {} as User,
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date()
      };
    }
  }
  
  validateUser(user: Partial<User>): boolean {
    return !!(user.name && user.email && user.name.length > 0);
  }
  
  filterUsersByRole(role: UserRole): User[] {
    return this.users.filter(user => user.roles.includes(role));
  }
  
  getUserStats(): { total: number; active: number; inactive: number } {
    const total = this.users.length;
    const active = this.users.filter(u => u.isActive).length;
    const inactive = total - active;
    
    return { total, active, inactive };
  }
}

// Generic function example
function createResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    data,
    message,
    status: 'success',
    timestamp: new Date()
  };
}

// Usage example
const userService = new UserService('https://api.example.com');
const response = createResponse<User[]>([], 'Users loaded successfully');

export { User, UserService, ApiResponse, UserRole };`;

export const DEFAULT_GRAPHQL = `type User{id:ID!name:String!email:String!age:Int posts:[Post!]!profile:UserProfile}type Post{id:ID!title:String!content:String!author:User!tags:[String!]!createdAt:String!updatedAt:String comments:[Comment!]!}type Comment{id:ID!content:String!author:User!post:Post!createdAt:String!}type UserProfile{bio:String avatar:String website:String location:String}input CreateUserInput{name:String!email:String!age:Int}input UpdateUserInput{name:String email:String age:Int}type Query{users:[User!]!user(id:ID!):User posts:[Post!]!post(id:ID!):Post searchPosts(query:String!):[Post!]!}type Mutation{createUser(input:CreateUserInput!):User!updateUser(id:ID!,input:UpdateUserInput!):User!deleteUser(id:ID!):Boolean!createPost(title:String!,content:String!,authorId:ID!):Post!}type Subscription{postAdded:Post!commentAdded(postId:ID!):Comment!}schema{query:Query mutation:Mutation subscription:Subscription}`;

// Converters
export const DEFAULT_JSON_YAML = `{
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
}`;

export const DEFAULT_URL_TO_JSON = `https://api.example.com/users?page=1&limit=10&sort=name&order=asc&filter=active&category=premium#section`;

export const DEFAULT_CSV_TO_JSON = `name,email,age,city
John Doe,john@example.com,30,New York
Jane Smith,jane@example.com,25,Los Angeles
Bob Johnson,bob@example.com,35,Chicago`;

// Encoders
export const DEFAULT_BASE64 = `Hello, World! This is a sample text for Base64 encoding.
It contains multiple lines and various characters: !@#$%^&*()
UTF-8 characters are also supported: 你好, мир, 🌍`;

export const DEFAULT_URL_ENCODER = `https://example.com/search?q=hello world&category=tech&date=2024-01-01`;

// Text Tools
export const DEFAULT_TEXT_DIFF_1 = `Hello World
This is line 2
This is line 3
This line will be removed
Common line`;

export const DEFAULT_TEXT_DIFF_2 = `Hello World
This is line 2 modified
This is line 3
New line added here
Common line`;

export const DEFAULT_REGEX_PATTERN = `\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b`;

export const DEFAULT_REGEX_TEXT = `Here are some email addresses:
john.doe@example.com
jane_smith123@company.org
test.email+tag@domain.co.uk
invalid.email@
another@valid-domain.net
not-an-email-address
support@website.info`;

export const DEFAULT_TEXT_SORT = `banana
apple
Cherry
apple
date
elderberry
Fig
grape
banana
11
2
100
21
Cherry
short
a very long line of text
medium line
short`;

export const DEFAULT_TEXT_COUNTER = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`;

export const DEFAULT_TEXT_SPLIT = `apple,banana,cherry,date,elderberry,fig,grape,honeydew,kiwi,lemon`;

export const DEFAULT_SEARCH_REPLACE_TEXT = `The quick brown fox jumps over the lazy dog.
The quick brown fox is very agile.
Every quick brown fox should jump daily.`;

export const DEFAULT_SEARCH_REPLACE_SEARCH = `quick brown fox`;

export const DEFAULT_SEARCH_REPLACE_REPLACE = `swift red wolf`;

// Hash Tools
export const DEFAULT_MD5 = `Hello, World! This is a sample text for MD5 hashing.`;

export const DEFAULT_BCRYPT = `mypassword123`;

// JWT
export const DEFAULT_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;

// Date/Time Tools
export const DEFAULT_DATE_CONVERTER = `2024-01-15T10:30:00.000Z`;

export const DEFAULT_TIMEZONE_CONVERTER = `2024-01-15 10:30:00`;

export const DEFAULT_DATETIME_DIFF_START = `2024-01-01 09:00:00`;

export const DEFAULT_DATETIME_DIFF_END = `2024-01-15 17:30:00`;

// Utility Tools
export const DEFAULT_UNIT_CONVERTER = `100`;

export const DEFAULT_NUMBER_BASE_CONVERTER = `255`;

// Generators
export const DEFAULT_QR_GENERATOR = "Visit FreeDevTool.App for more amazing developer tools!";

export const DEFAULT_BARCODE_GENERATOR = "FreeDevTool.App";

export const DEFAULT_COLOR_PALETTE_GENERATOR = "#3B82F6";

// TLS Decoder
export const DEFAULT_TLS_DECODER = `-----BEGIN CERTIFICATE-----
MIIDBTCCAe2gAwIBAgIJAKZYzZYzZYzZMA0GCSqGSIb3DQEBCwUAMBkxFzAVBgNV
BAMMDnNhbXBsZS5leGFtcGxlMB4XDTI0MDEwMTAwMDAwMFoXDTI1MDEwMTAwMDAw
MFowGTEXMBUGA1UEAwwOc2FtcGxlLmV4YW1wbGUwggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQC/Sample/Certificate/Data/Here/This/Is/Just/Example
-----END CERTIFICATE-----`;

// Financial Calculators
export const DEFAULT_DEBT_PRINCIPAL = 25000;
export const DEFAULT_DEBT_ANNUAL_RATE = 18.5;
export const DEFAULT_DEBT_MONTHLY_PAYMENT = 800;

export const DEFAULT_COMPOUND_PRINCIPAL = 10000;
export const DEFAULT_COMPOUND_ANNUAL_RATE = 12;
export const DEFAULT_COMPOUND_YEARS = 20;
export const DEFAULT_COMPOUND_MONTHLY_CONTRIBUTION = 500;