/**
 * Alankars — transcribed from the Notion page "Alankars"
 * (Learnings / Ragas & songs). All 53, across its 9 groups.
 *
 * Stored in **Bilawal only**. Every other thaat is derived at render time by
 * `transpose()`, so adding an alankar means adding one Bilawal entry.
 *
 * Notation in the source data:
 *   S R G m P D N   swaras; lowercase m = shuddha madhyam
 *   S.              dot AFTER  = taar saptak (upper octave)
 *   .N              dot BEFORE = mandra saptak (lower octave)
 *   S(.N)(.D)       brackets bind a dot to one swara, and never render
 *
 * A dot between two swaras belongs to whichever of them the writer meant, and
 * unbracketed it binds backwards: `S.ND` is taar sa, then N and D. Bracket it
 * only where that is wrong — a descent *below* sa, as in alankars 38 and 43,
 * where `S(.N)(.D)(.P)` would otherwise read as three taar swaras.
 */

/** One labelled block of an alankar — usually Aroha or Avaroha. */
export interface AlankarPart {
  label: string;
  lines: string[];
  /** Centre the lines. Set on the meru pyramid, whose shape is the point. */
  align?: 'center';
}

export interface Alankar {
  n: number;
  group: string;
  /** Short aside shown after the group name, e.g. "ladder — reducing". */
  note?: string;
  parts: AlankarPart[];
}

export const ALANKAR_GROUPS: readonly string[] = [
  'Scale & repeated notes',
  'Ascending groups of increasing length',
  'Interval (skip) alankars',
  'Doubled-note patterns',
  'Prefix & overlapping patterns',
  'Turn & pivot patterns',
  'Zig-zag (aroha–avaroha combined)',
  'Long / composite patterns',
  'Pyramid (Meru)',
];

/** The common shape: an Aroha line (or lines) and an Avaroha line. */
function av(
  n: number,
  g: number,
  aroha: string | string[],
  avaroha: string | string[],
  extra: Partial<Alankar> = {},
): Alankar {
  return {
    n,
    group: ALANKAR_GROUPS[g],
    parts: [
      { label: 'Aroha', lines: ([] as string[]).concat(aroha) },
      { label: 'Avaroha', lines: ([] as string[]).concat(avaroha) },
    ],
    ...extra,
  };
}

export const ALANKARS: readonly Alankar[] = [
  av(1, 0, 'S R G m P D N S.', 'S. N D P m G R S'),
  av(2, 0, 'SS RR GG mm PP DD NN S.S.', 'S.S. NN DD PP mm GG RR SS'),
  av(3, 0, 'SSS RRR GGG mmm PPP DDD NNN S.S.S.', 'S.S.S. NNN DDD PPP mmm GGG RRR SSS'),
  av(4, 0, 'SSSS RRRR GGGG mmmm PPPP DDDD NNNN S.S.S.S.', 'S.S.S.S. NNNN DDDD PPPP mmmm GGGG RRRR SSSS'),

  av(5, 1, 'SRG RGm GmP mPD PDN DNS.', 'S.ND NDP DPm PmG mGR GRS'),
  av(6, 1, 'SRGm RGmP GmPD mPDN PDNS.', 'S.NDP NDPm DPmG PmGR mGRS'),
  av(7, 1, 'SRGmP RGmPD GmPDN mPDNS.', 'S.NDPm NDPmG DPmGR PmGRS'),
  av(8, 1, 'SRGmPD RGmPDN GmPDNS.', 'S.NDPmG NDPmGR DPmGRS'),
  av(9, 1, 'SRGmPDN RGmPDNS.', 'S.NDPmGR NDPmGRS'),

  av(10, 2, 'SG Rm GP mD PN DS.', 'S.D NP Dm PG mR GS'),
  av(11, 2, 'Sm RP GD mN PS.', 'S.P Nm DG PR mS'),
  av(12, 2, 'SP RD GN mS.', 'S.m NG DR PS'),
  av(13, 2, 'SGP RmD GPN mDS.', 'S.Dm NPG DmR PGS'),
  av(14, 2, 'SR RG Gm mP PD DN NS.', 'S.N ND DP Pm mG GR RS'),
  av(15, 2, 'SR-RG, RG-Gm, Gm-mP, mP-PD, PD-DN, DN-NS.', 'S.N-ND, ND-DP, DP-Pm, Pm-mG, mG-GR, GR-RS'),
  av(16, 2, 'RS GR mG Pm DP ND S.N R.S.', 'S.R. NS. DN PD mP Gm RG SR'),

  av(17, 3, 'SRGG RGmm GmPP mPDD PDNN DNS.S.', 'S.NDD NDPP DPmm PmGG mGRR GRSS'),
  av(18, 3, 'SSRG RRGm GGmP mmPD PPDN DDNS.', 'S.S.ND NNDP DDPm PPmG mmGR GGRS'),
  av(19, 3, 'SGGR RmmG GPPm mDDP PNND DS.S.N NR.R.S.', 'S.DDN NPPD DmmP PGGm mRRG GSSR R(.N)(.N)S'),
  av(20, 3, 'SRGm PP, RGmP DD, GmPD NN, mPDN S.S.', 'S.NDP mm, NDPm GG, DPmG RR, PmGR SS'),
  av(21, 3, 'SR SR GG, RG RG mm, Gm Gm PP, mP mP DD, PD PD NN, DN DN S.S.', 'S.N S.N DD, ND ND PP, DP DP mm, Pm Pm GG, mG mG RR, GR GR SS'),

  av(22, 4, 'SR SRG, RG RGm, Gm GmP, mP mPD, PD PDN, DN DNS.', 'S.N S.ND, ND NDP, DP DPm, Pm PmG, mG mGR, GR GRS'),
  av(23, 4, 'SR SRGm, RG RGmP, Gm GmPD, mP mPDN, PD PDNS.', 'S.N S.NDP, ND NDPm, DP DPmG, Pm PmGR, mG mGRS'),
  av(24, 4, 'SRG SRG SRGm, RGm RGm RGmP, GmP GmP GmPD, mPD mPD mPDN, PDN PDN PDNS.', 'S.ND S.ND S.NDP, NDP NDP NDPm, DPm DPm DPmG, PmG PmG PmGR, mGR mGR mGRS'),
  av(25, 4, 'SR SG RGm, RG Rm GmP, Gm GP mPD, mP mD PDN, PD PN DNS.', 'S.N S.D NDP, ND NP DPm, DP Dm PmG, Pm PG mGR, mG mR GRS'),
  av(26, 4, 'SRG-RG, RGm-Gm, GmP-mP, mPD-PD, PDN-DN, DNS.-NS.', 'S.ND-ND, NDP-DP, DPm-Pm, PmG-mG, mGR-GR, GRS-RS'),
  av(27, 4, 'SRG-SRGm, RGm-RGmP, GmP-GmPD, mPD-mPDN, PDN-PDNS.', 'S.ND-S.NDP, NDP-NDPm, DPm-DPmG, PmG-PmGR, mGR-mGRS'),
  av(28, 4, 'SG SG SRGm / Rm Rm RGmP / GP GP GmPD / mD mD mPDN / PN PN PDNS.', 'S.D S.D S.NDP / NP NP NDPm / Dm Dm DPmG / PG PG PmGR / mR mR mGRS'),
  av(29, 4, 'Sm Sm SRGm / RP RP RGmP / GD GD GmPD / mN mN mPDN / PS. PS. PDNS.', 'S.P S.P S.NDP / Nm Nm NDPm / DG DG DPmG / PR PR PmGR / mS mS mGRS'),

  av(30, 5, 'SRS, RGR, GmG, mPm, PDP, DND, NS.N, S.R.S.', 'S.R.S., NS.N, DND, PDP, mPm, GmG, RGR, SRS'),
  av(31, 5, 'SRSG, RGRm, GmGP, mPmD, PDPN, DNDS.', 'S.NS.D, NDNP, DPDm, PmPG, mGmR, GRGS'),
  av(32, 5, 'SGRS, RmGR, GPmG, mDPm, PNDP, DS.ND, NR.S.N, S.G.R.S.', 'S.DNS., NPDN, DmPD, PGmP, mRGm, GSRG, R(.N)SR, S(.D)(.N)S'),
  av(33, 5, 'GRSRG, mGRGm, PmGmP, DPmPD, NDPDN, S.NDNS.', '(S.)NDNS., NDPDN, DPmPD, PmGmP, mGRGm, GRSRG, RS(.N)SR, S(.N)(.D)(.N)S'),
  {
    n: 34, group: ALANKAR_GROUPS[5],
    parts: [
      { label: 'Aroha', lines: ['GR SRS GRS / mG RGR mGR / Pm GmG PmG / DP mPm DPm / ND PDP NDP / S.N DND S.ND'] },
      { label: 'Ending', lines: ['S.NDPmGRS'] }
    ]
  },

  av(35, 6, 'GRS, mGR, PmG, DPm, NDP, S.ND, R.S.N, G.R.S.', 'S.R.G., NS.R., DNS., PDN, mPD, GmP, RGm, SRG, .NSR, .D.NS'),
  av(36, 6, 'mGRS, PmGR, DPmG, NDPm, S.NDP, R.S.ND, G.R.S.N, m.G.R.S.', 'S.R.G.m., NS.R.G., DNS.R., PDNS., mPDN, GmPD, RGmP, SRGm, .NSRG, .D.NSR, .P.D.NS'),
  av(37, 6, 'SRG mGR, RGm PmG, GmP DPm, mPD NDP, PDN S.ND, DNS. R.S.N, NS.R. G.R.S.', 'NS.R. G.R.S., DNS. R.S.N, PDN S.ND, mPD NDP, GmP DPm, RGm PmG, SRG mGR, .NSR GRS'),
  av(38, 6, 'SRGm-mGRS, RGmP-PmGR, GmPD-DPmG, mPDN-NDPm, PDNS.-S.NDP, DNS.R.-R.S.ND, NS.R.G.-G.R.S.N, S.R.G.m.-m.G.R.S.', 'S.NDP-PDNS., NDPm-mPDN, DPmG-GmPD, PmGR-RGmP, mGRS-SRGm, GRS(.N)-.NSRG, RS(.N)(.D)-.D.NSR, S(.N)(.D)(.P)-.P.D.NS'),
  {
    n: 39, group: ALANKAR_GROUPS[6],
    parts: [{ label: '', lines: ['mGRS PmGR DPmG NDPm S.NDP R.S.ND S.NDPmGRS'] }]
  },
  {
    n: 40, group: ALANKAR_GROUPS[6],
    parts: [{
      label: '', lines: [
        'S .N | RS | GR | mGRS',
        'RS | GR | mG | PmGR',
        'GR | mG | Pm | DPmG',
        'mG | Pm | DP | NDPm',
        'Pm | DP | ND | S.NDP',
        'DP | ND | S.N | R.S.ND',
        'ND | S.N | R.S. | G.R.S.N'
      ]
    }]
  },
  {
    n: 41, group: ALANKAR_GROUPS[6],
    parts: [{ label: '', lines: ['S.S.ND, NNDP, DDPm, PPmG, GmPDNDPm, GmPGmGRS'] }]
  },
  {
    n: 42, group: ALANKAR_GROUPS[6],
    parts: [
      { label: '', lines: ['mGP-SR, PmD-RG, DPN-Gm, NDS.-mP'] },
      { label: '', lines: ['PDNS., mPDNS., GmPDNS., RGmPDNS., SRGmPDNS.'] }
    ]
  },

  av(43, 7, 'SRGm S, RGmP R, GmPD G, mPDN m, PDNS. P, DNS.R. D, NS.R.G. N, S.R.G.m. S.', 'S.NDP S., NDPm N, DPmG D, PmGR P, mGRS m, GRS(.N) G, RS(.N)(.D) R, S(.N)(.D)(.P) S'),
  av(44, 7, 'SGRG SRSS, RmGm RGRR, GPmP GmGG, mDPD mPmm, PNDN PDPP, DS.NS. DNDD, NR.S.R. NS.NN, S.G.R.G. S.R.S.S.', 'S.DND S.NS.S., NPDP NDNN, DmPm DPDD, PGmG PmPP, mRGR mGmm, GSRS GRGG, R(.N)S(.N) RSRR, S(.D)(.N)(.D) S(.N)SS'),
  av(45, 7, 'SRGm SRGm, SRGmPDNS.', '(S.)NDP (S.)NDP, S.NDPmGRS'),
  av(46, 7, 'SRGm mGRS, SRGm mGRS, SRGmPDNS.', '(S.)NDP PDNS., (S.)NDP PDNS., S.NDPmGRS'),
  av(47, 7, 'SRGm, SR, SR, SRGmPDNS.', 'S.NDP, S.N, S.N, S.NDPmGRS'),
  av(48, 7, 'SRG SRG SR SRGmPDNS.', 'S.ND S.ND S.N S.NDPmGRS'),
  av(49, 7, 'SRGmPmGR SRGmPDNS.', 'S.NDPmPDN S.NDPmGRS'),
  av(50, 7, 'SRGm Pm DP, SRGmPDNS.', 'S.NDP DP Gm, S.NDPmGRS'),
  {
    n: 51, group: ALANKAR_GROUPS[7],
    parts: [{ label: '', lines: ['SR-S, SRG-R, SRGm-G, SRGmP-m, SRGmPD-P, SRGmPDN-D, SRGmPDNS.-N, SRGmPDNS.-S.NDPmGRS'] }]
  },
  {
    n: 52, group: ALANKAR_GROUPS[7], note: 'ladder — reducing',
    parts: [{
      label: '', lines: [
        'SRGmPDNS.', 'SRGmPDN', 'SRGmPD', 'SRGmP', 'SRGm', 'SRG', 'SR', 'S'
      ]
    }]
  },
  {
    n: 53, group: ALANKAR_GROUPS[8], note: 'meru — build and unwind',
    parts: [
      {
        label: 'Aroha', align: 'center', lines: [
          'S',
          'SRS',
          'SRGRS',
          'SRGmGRS',
          'SRGmPmGRS',
          'SRGmPDPmGRS',
          'SRGmPDNDPmGRS',
          'SRGmPDNS.NDPmGRS',
          'SRGmPDNS.'
        ]
      },
      {
        label: 'Avaroha', align: 'center', lines: [
          'S.',
          'S.NS.',
          'S.NDNS.',
          'S.NDPDNS.',
          'S.NDPmPDNS.',
          'S.NDPmGmPDNS.',
          'S.NDPmGRGmPDNS.',
          'S.NDPmGRSRGmPDNS.',
          'S.NDPmGRS'
        ]
      }
    ]
  }
];
