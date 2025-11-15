import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPieceFromType,
  getRandomTetromino,
  TETROMINOES,
  Block,
} from "../tetrominoShapes";

describe("tetrominoShapes", () => {
  describe("getPieceFromType", () => {
    it("should return correct tetromino for I piece", () => {
      const piece = getPieceFromType("I");

      expect(piece).toEqual({
        name: "I",
        shape: TETROMINOES.I.shape,
        color: Block.I,
      });
    });

    it("should return correct tetromino for O piece", () => {
      const piece = getPieceFromType("O");

      expect(piece).toEqual({
        name: "O",
        shape: TETROMINOES.O.shape,
        color: Block.O,
      });
    });

    it("should return correct tetromino for T piece", () => {
      const piece = getPieceFromType("T");

      expect(piece).toEqual({
        name: "T",
        shape: TETROMINOES.T.shape,
        color: Block.T,
      });
    });

    it("should return I piece for invalid type", () => {
      const piece = getPieceFromType("INVALID");

      expect(piece).toEqual({
        name: "I",
        shape: TETROMINOES.I.shape,
        color: Block.I,
      });
    });

    it("should return I piece for null type", () => {
      const piece = getPieceFromType(null);

      expect(piece).toEqual({
        name: "I",
        shape: TETROMINOES.I.shape,
        color: Block.I,
      });
    });

    it("should return I piece for undefined type", () => {
      const piece = getPieceFromType();

      expect(piece).toEqual({
        name: "I",
        shape: TETROMINOES.I.shape,
        color: Block.I,
      });
    });

    it("should return pieces with correct shapes for all types", () => {
      const types = ["I", "O", "T", "S", "Z", "J", "L"];

      types.forEach((type) => {
        const piece = getPieceFromType(type);
        expect(piece.name).toBe(type);
        expect(piece.shape).toBeDefined();
        expect(piece.color).toBe(Block[type]);
      });
    });
  });

  describe("getRandomTetromino", () => {
    let mathRandomSpy;

    afterEach(() => {
      if (mathRandomSpy) {
        mathRandomSpy.mockRestore();
      }
    });

    it("should return a valid tetromino", () => {
      const piece = getRandomTetromino();

      expect(piece).toHaveProperty("name");
      expect(piece).toHaveProperty("shape");
      expect(piece).toHaveProperty("color");
      expect(["I", "O", "T", "S", "Z", "J", "L"]).toContain(piece.name);
    });

    it("should return I piece when random is 0", () => {
      mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
      const piece = getRandomTetromino();

      expect(piece.name).toBe("I");
    });

    it("should return different pieces over multiple calls", () => {
      const pieces = Array.from({ length: 20 }, () => getRandomTetromino());
      const uniqueNames = new Set(pieces.map((p) => p.name));

      // Should have at least 2 different types
      expect(uniqueNames.size).toBeGreaterThan(1);
    });

    it("should return pieces with valid shapes and colors", () => {
      const pieces = Array.from({ length: 10 }, () => getRandomTetromino());

      pieces.forEach((piece) => {
        expect(Array.isArray(piece.shape)).toBe(true);
        expect(piece.shape.length).toBeGreaterThan(0);
        expect(piece.color).toBeDefined();
      });
    });
  });
});
