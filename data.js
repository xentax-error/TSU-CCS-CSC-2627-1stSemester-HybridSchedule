const F2F_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const F2F_SCHEDULE = {
  Monday: [
    "BSIS-1B", "BSIS-2B",
    "BSCS-1C", "BSCS-2B",
    "TSM-1B", "TSM-2B",
    "NA-2B",
    "WMA-1C", "WMA-1D", "WMA-1E", "WMA-2C", "WMA-2D", "WMA-2E", "WMA-4C",
    "CC6-FREE3", "WD-FREE1", "WMA3-FREE1", "CC2-FREE6", "CC2-FREE4", "CC2-FREE3",
    "CCNA1-FREE3", "CCNA1-FREE4", "CCNA1-FREE6", "PLF-FREE1", "CC1-FREE1"
  ],
  Tuesday: [
    "BSIS-1A", "BSIS-3A", "BSIS-4A", "BSIS-4B",
    "BSCS-2A", "BSCS-3A", "BSCS-3B", "BSCS-4A",
    "TSM-1A", "TSM-3B",
    "NA-1A", "NA-3A", "NA-3B", "NA-4B",
    "WMA-1A", "WMA-1E", "WMA-2B", "WMA-3A", "WMA-3B", "WMA-4A",
    "WEBAPP-FREE1"
  ],
  Wednesday: [
    "BSIS-3B", "BSIS-4A", "BSIS-4B",
    "BSCS-1A", "BSCS-2A", "BSCS-3A", "BSCS-3B",
    "TSM-1A", "TSM-2A", "TSM-3A", "TSM-3B",
    "NA-1B", "NA-3A", "NA-3B",
    "WMA-1A", "WMA-1B", "WMA-2B", "WMA-3A", "WMA-3B", "WMA-4A", "WMA-4B",
    "CC6-FREE1", "SOFTENG-FREE1", "WEBPROG-FREE1", "CC2-FREE7"
  ],
  Thursday: [
    "BSIS-2A", "BSIS-3A", "BSIS-3B",
    "BSCS-1A", "BSCS-1B", "BSCS-3A", "BSCS-3B", "BSCS-4B",
    "TSM-1A", "TSM-2A", "TSM-3A",
    "NA-1B", "NA-1C", "NA-2A", "NA-3B", "NA-4A",
    "WMA-1B", "WMA-2A", "WMA-2B", "WMA-3A", "WMA-4B", "WMA-4C",
    "CCNA1-FREE1", "CC2-FREE5"
  ],
  Friday: [
    "BSIS-1A", "BSIS-2A", "BSIS-3A", "BSIS-3B",
    "BSCS-1B", "BSCS-4C",
    "TSM-2A", "TSM-3A", "TSM-3B", "TSM-4A", "TSM-4B",
    "NA-1A", "NA-2A",
    "WMA-1A", "WMA-1B", "WMA-2A", "WMA-4A", "WMA-4B",
    "CC2-FREE8", "CC2-FREE9", "CCNA1-FREE2", "CCNA1-FREE5"
  ],
  Saturday: [
    "BSIS-1B", "BSIS-2B", 
    "BSCS-1C", "BSCS-2B",
    "TSM-1B", "TSM-1C", "TSM-2B",
    "NA-1C", "NA-2B",
    "WMA-1C", "WMA-1D", "WMA-2C", "WMA-2D", "WMA-2E",
    "CC6-FREE2", "WD-FREE2", "WMA4-FREE1", "IPT2-FREE1", "CC2-FREE1", "CC2-FREE2"
  ]
};

const PREFIX_TO_PROGRAM = {
  BSCS: "CS",
  BSIS: "IS",
  TSM: "IT-TSM",
  NA: "IT-NA",
  WMA: "IT-WMA"
};

const PROGRAM_LABELS = {
  all: "All programs",
  CS: "BS Computer Science",
  IS: "BS Information Systems – Business Analytics",
  "IT-NA": "BS Information Technology – Network Administration",
  "IT-TSM": "BS Information Technology – Technical Service Management",
  "IT-WMA": "BS Information Technology – Web and Mobile Application"
};

const FREE_CODE_INFO = {
  CC1: { confirmed: true, programs: [{ program: "CS", year: 1 }, { program: "IT-NA", year: 1 }, { program: "IT-WMA", year: 1 }, { program: "IS", year: 1 }, { program: "IT-TSM", year: 1 }] },
  CC2: { confirmed: true, programs: [{ program: "CS", year: 1 }, { program: "IT-NA", year: 1 }, { program: "IT-WMA", year: 1 }, { program: "IS", year: 1 }, { program: "IT-TSM", year: 1 }] },
  PLF: { confirmed: true, programs: [{ program: "CS", year: 1 }, { program: "IT-NA", year: 1 }, { program: "IT-WMA", year: 1 }, { program: "IS", year: 1 }, { program: "IT-TSM", year: 1 }] },
  CCNA1: { confirmed: true, programs: [{ program: "CS", year: 2 }, { program: "IT-NA", year: 2 }, { program: "IT-WMA", year: 2 }, { program: "IS", year: 2 }, { program: "IT-TSM", year: 2 }] },
  CC6: { confirmed: true, programs: [{ program: "CS", year: 3 }, { program: "IT-NA", year: 3 }, { program: "IT-WMA", year: 3 }, { program: "IT-TSM", year: 3 }] },
  SOFTENG: { confirmed: true, programs: [{ program: "CS", year: 3 }] },
  WEBPROG: { confirmed: true, programs: [{ program: "CS", year: 3 }] },
  WD: { confirmed: true, programs: [{ program: "IT-NA", year: 3 }, { program: "IT-WMA", year: 3 }, { program: "IT-TSM", year: 3 }] },
  WMA3: { confirmed: true, programs: [{ program: "IT-WMA", year: 4 }] },
  WMA4: { confirmed: true, programs: [{ program: "IT-WMA", year: 4 }] },
  IPT2: { confirmed: true, programs: [{ program: "IT-WMA", year: 4 }] },
  WEBAPP: { confirmed: true, programs: [{ program: "IT-NA", year: null }, { program: "IT-WMA", year: null }, { program: "IS", year: null }, { program: "IT-TSM", year: null }] }
};


function parseScheduleCode(code) {
  const freeMatch = code.match(/^([A-Z0-9]+)-FREE(\d+)$/);
  if (freeMatch) {
    const courseCode = freeMatch[1];
    const info = FREE_CODE_INFO[courseCode] || null;
    return {
      raw: code,
      kind: "free",
      courseCode: courseCode,
      freeNumber: freeMatch[2],
      confirmed: info ? info.confirmed : false,
      programs: info ? info.programs : []
    };
  }

  const sectionMatch = code.match(/^([A-Z]+)-(\d)([A-Z])$/);
  if (sectionMatch) {
    const prefix = sectionMatch[1];
    const program = PREFIX_TO_PROGRAM[prefix] || null;
    return {
      raw: code,
      kind: "regular",
      program: program,
      year: parseInt(sectionMatch[2], 10),
      section: sectionMatch[3]
    };
  }

  return { raw: code, kind: "unknown" };
}
