import { describe, it, expect } from "vitest";
import {
  encodeBase64,
  decodeBase64,
  encodeURL,
  decodeURL,
  jsonToYaml,
  yamlToJson,
  decodeJWT,
  decodeTLSCertificate,
} from "../../client/src/lib/encoders";

describe("Base64 Encoding/Decoding", () => {
  it("should encode simple text to base64", () => {
    const input = "Hello World";
    const result = encodeBase64(input);
    expect(result).toBe("SGVsbG8gV29ybGQ=");
  });

  it("should decode valid base64 to text", () => {
    const input = "SGVsbG8gV29ybGQ=";
    const result = decodeBase64(input);
    expect(result).toBe("Hello World");
  });

  it("should handle UTF-8 characters in base64 encoding", () => {
    const input = "Hello 世界 🌍";
    const encoded = encodeBase64(input);
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe(input);
  });

  it("should throw error for Failed to decode Base64", () => {
    const invalidBase64 = "Invalid@Base64!";
    expect(() => decodeBase64(invalidBase64)).toThrow(
      "Failed to decode Base64"
    );
  });

  it("should handle empty string encoding/decoding", () => {
    const empty = "";
    const encoded = encodeBase64(empty);
    const decoded = decodeBase64(encoded);
    expect(decoded).toBe(empty);
  });
});

describe("URL Encoding/Decoding", () => {
  it("should encode special characters in URL", () => {
    const input = "hello world & more!";
    const result = encodeURL(input);
    expect(result).toBe("hello%20world%20%26%20more!");
  });

  it("should decode URL encoded string", () => {
    const input = "hello%20world%20%26%20more!";
    const result = decodeURL(input);
    expect(result).toBe("hello world & more!");
  });

  it("should handle already encoded URLs", () => {
    const input = "test%20data";
    const decoded = decodeURL(input);
    expect(decoded).toBe("test data");
  });

  it("should throw error for Failed to decode URL", () => {
    const invalidURL = "test%GG";
    expect(() => decodeURL(invalidURL)).toThrow("Failed to decode URL");
  });

  it("should handle empty string", () => {
    expect(encodeURL("")).toBe("");
    expect(decodeURL("")).toBe("");
  });
});

describe("JSON to YAML Conversion", () => {
  it("should convert simple JSON to YAML", () => {
    const json = '{"name": "John", "age": 30}';
    const result = jsonToYaml(json);
    expect(result.error).toBeUndefined();
    expect(result.result).toContain("name: John");
    expect(result.result).toContain("age: 30");
  });

  it("should convert nested JSON to YAML", () => {
    const json =
      '{"user": {"name": "John", "details": {"age": 30, "city": "NYC"}}}';
    const result = jsonToYaml(json);
    expect(result.error).toBeUndefined();
    expect(result.result).toContain("user:");
    expect(result.result).toContain("name: John");
    expect(result.result).toContain("details:");
  });

  it("should handle invalid JSON gracefully", () => {
    const invalidJson = '{"name": "John", "age":}';
    const result = jsonToYaml(invalidJson);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("JSON to YAML conversion error");
    expect(result.result).toBe(invalidJson);
  });

  it("should handle arrays in JSON", () => {
    const json = '{"items": ["apple", "banana", "cherry"]}';
    const result = jsonToYaml(json);
    expect(result.error).toBeUndefined();
    expect(result.result).toContain("items:");
    expect(result.result).toContain("- apple");
  });
});

describe("YAML to JSON Conversion", () => {
  it("should convert simple YAML to JSON", () => {
    const yaml = "name: John\nage: 30";
    const result = yamlToJson(yaml);
    expect(result.error).toBeUndefined();
    const parsed = JSON.parse(result.result);
    expect(parsed.name).toBe("John");
    expect(parsed.age).toBe(30);
  });

  it("should handle invalid YAML gracefully", () => {
    const invalidYaml = "name: John\n  age: 30\n invalid: [{";
    const result = yamlToJson(invalidYaml);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("YAML to JSON conversion error");
    expect(result.result).toBe(invalidYaml);
  });

  it("should handle nested YAML structures", () => {
    const yaml = "user:\n  name: John\n  details:\n    age: 30\n    city: NYC";
    const result = yamlToJson(yaml);
    expect(result.error).toBeUndefined();
    const parsed = JSON.parse(result.result);
    expect(parsed.user.name).toBe("John");
    expect(parsed.user.details.age).toBe(30);
  });
});

describe("JWT Decoding", () => {
  it("should decode valid JWT token", () => {
    // Sample JWT token for testing (header.payload.signature)
    const validJWT =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const result = decodeJWT(validJWT);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.header.alg).toBe("HS256");
    expect(result.header.typ).toBe("JWT");
    expect(result.payload.sub).toBe("1234567890");
    expect(result.payload.name).toBe("John Doe");
    expect(result.signature).toBe(
      "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
  });

  it("should handle invalid JWT format", () => {
    const invalidJWT = "invalid.jwt";
    const result = decodeJWT(invalidJWT);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid JWT format");
    expect(result.header).toEqual({});
    expect(result.payload).toEqual({});
    expect(result.signature).toBe("");
  });

  it("should handle malformed JWT parts", () => {
    const malformedJWT = "invalid.base64.part";
    const result = decodeJWT(malformedJWT);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("JWT decode error");
  });

  it("should handle empty JWT", () => {
    const result = decodeJWT("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid JWT format");
  });
});

describe("TLS Certificate Decoding", () => {
  it("should detect invalid certificate format", () => {
    const invalidCert = "This is not a certificate";
    const result = decodeTLSCertificate(invalidCert);

    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Invalid certificate format. Please provide a PEM encoded certificate."
    );
    expect(result.subject).toBe("");
    expect(result.issuer).toBe("");
  });

  it("should return mock data for valid certificate format", () => {
    const validCertFormat = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAOC1j2CAh/9QMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
-----END CERTIFICATE-----`;

    const result = decodeTLSCertificate(validCertFormat);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.subject).toBe("CN=example.com, O=Example Corp, C=US");
    expect(result.issuer).toBe("CN=Example CA, O=Example CA Corp, C=US");
    expect(result.serialNumber).toBe("1234567890ABCDEF");
    expect(result.algorithm).toBe("SHA256withRSA");
  });

  it("should handle empty certificate input", () => {
    const result = decodeTLSCertificate("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(
      "Invalid certificate format. Please provide a PEM encoded certificate."
    );
  });
});
