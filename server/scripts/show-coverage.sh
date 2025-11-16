#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${BLUE}       TETRIS BACKEND API - TEST COVERAGE REPORT           ${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Run coverage
echo -e "${YELLOW}Running tests with coverage...${NC}"
npm run test:coverage --silent

echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}                    COVERAGE DETAILS                         ${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if coverage directory exists
if [ -d "coverage" ]; then
    echo -e "${GREEN}✓${NC} Coverage report generated successfully!"
    echo ""
    echo -e "${BOLD}View detailed HTML report:${NC}"
    echo -e "  Open: ${BLUE}coverage/lcov-report/index.html${NC}"
    echo ""
    
    # Check if xdg-open is available (Linux)
    if command -v xdg-open &> /dev/null; then
        echo -e "${YELLOW}Opening HTML report in browser...${NC}"
        xdg-open coverage/lcov-report/index.html 2>/dev/null &
    # Check if open is available (macOS)
    elif command -v open &> /dev/null; then
        echo -e "${YELLOW}Opening HTML report in browser...${NC}"
        open coverage/lcov-report/index.html 2>/dev/null &
    # Check if wslview is available (WSL)
    elif command -v wslview &> /dev/null; then
        echo -e "${YELLOW}Opening HTML report in browser...${NC}"
        wslview coverage/lcov-report/index.html 2>/dev/null &
    else
        echo -e "${YELLOW}Tip:${NC} Manually open ${BLUE}coverage/lcov-report/index.html${NC} in your browser"
    fi
else
    echo -e "${RED}✗${NC} Coverage report not found"
fi

echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}                 WHAT'S BEING TESTED                        ${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Controllers (Auth, User, Game, GameHistory, Stats)"
echo -e "  ${GREEN}✓${NC} Services (User, Game, GameHistory, Stats)"
echo -e "  ${GREEN}✓${NC} Middlewares (Auth, Error handling)"
echo -e "  ${GREEN}✓${NC} Models & Repositories"
echo -e "  ${GREEN}✓${NC} API Routes & Integration tests"
echo -e "  ${GREEN}✓${NC} Socket.io Event Handlers"
echo ""
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}                  COVERAGE REPORT READY!                   ${NC}"
echo -e "${BOLD}${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Quick coverage summary from Jest output
if [ -f "coverage/coverage-summary.json" ]; then
    echo -e "${BOLD}Quick Summary:${NC}"
    echo ""
    # Parse coverage-summary.json for total coverage
    if command -v node &> /dev/null; then
        node -e "
        const fs = require('fs');
        const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
        const total = coverage.total;
        console.log('  Lines:      ' + total.lines.pct + '%');
        console.log('  Statements: ' + total.statements.pct + '%');
        console.log('  Functions:  ' + total.functions.pct + '%');
        console.log('  Branches:   ' + total.branches.pct + '%');
        " 2>/dev/null
    fi
    echo ""
fi

echo -e "${BOLD}Additional Commands:${NC}"
echo -e "  • ${BLUE}npm test${NC}              - Run tests without coverage"
echo -e "  • ${BLUE}npm run test:watch${NC}    - Run tests in watch mode"
echo -e "  • ${BLUE}npm run test:coverage${NC} - Generate coverage report"
echo ""
