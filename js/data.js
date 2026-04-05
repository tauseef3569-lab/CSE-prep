// ===== BTECH CSE ENTRANCE EXAM CHAPTER DATA =====
// Standard syllabus topics with weightage classifications
// High = 100-150 marks, Medium = 50-100 marks, Low = <50 marks

const DEFAULT_CHAPTERS = [
    // MATHEMATICS (High Weightage - Usually 30-40% of exam)
    {
        id: 'math-1',
        name: 'Sets, Relations & Functions',
        weightage: 'high',
        totalDays: 7,
        description: 'Sets representation, types of sets, relations, functions, types of functions, composition of functions.',
        subtopics: [
            'Sets and their representations',
            'Union, Intersection, Difference of sets',
            'Relations - types and properties',
            'Functions - types, domain, range',
            'Composition of functions',
            'Inverse functions'
        ]
    },
    {
        id: 'math-2',
        name: 'Complex Numbers & Quadratic Equations',
        weightage: 'high',
        totalDays: 7,
        description: 'Algebra of complex numbers, Argand plane, De Moivre\'s theorem, quadratic equations in complex domain.',
        subtopics: [
            'Complex numbers - algebra',
            'Argand diagram and polar form',
            'De Moivre\'s theorem',
            'Quadratic equations',
            'Nature of roots',
            'Complex roots'
        ]
    },
    {
        id: 'math-3',
        name: 'Matrices & Determinants',
        weightage: 'high',
        totalDays: 8,
        description: 'Matrix operations, types of matrices, determinants, properties, adjoint, inverse, solving linear equations.',
        subtopics: [
            'Types of matrices',
            'Matrix operations (addition, multiplication)',
            'Determinants and properties',
            'Adjoint and inverse',
            'Solving linear equations using matrices',
            'Cramer\'s rule'
        ]
    },
    {
        id: 'math-4',
        name: 'Limits, Continuity & Differentiability',
        weightage: 'high',
        totalDays: 10,
        description: 'Limits of functions, continuity, differentiability, differentiation rules, L\'Hospital\'s rule.',
        subtopics: [
            'Limits and their properties',
            'Continuity of functions',
            'Differentiability',
            'Differentiation rules',
            'Higher order derivatives',
            'L\'Hospital\'s rule'
        ]
    },
    {
        id: 'math-5',
        name: 'Integration & Its Applications',
        weightage: 'high',
        totalDays: 12,
        description: 'Indefinite and definite integrals, integration techniques, area under curves, applications.',
        subtopics: [
            'Indefinite integrals',
            'Methods of integration',
            'Definite integrals',
            'Area under curves',
            'Properties of definite integrals',
            'Applications of integration'
        ]
    },
    {
        id: 'math-6',
        name: 'Probability',
        weightage: 'medium',
        totalDays: 8,
        description: 'Probability basics, conditional probability, Bayes\' theorem, random variables, distributions.',
        subtopics: [
            'Basic probability concepts',
            'Conditional probability',
            'Bayes\' theorem',
            'Random variables',
            'Binomial distribution',
            'Normal distribution'
        ]
    },

    // PHYSICS (High Weightage)
    {
        id: 'phy-1',
        name: 'Mechanics - Kinematics & Laws of Motion',
        weightage: 'high',
        totalDays: 10,
        description: 'Motion in 1D/2D/3D, projectile motion, Newton\'s laws, friction, circular motion.',
        subtopics: [
            'Motion in a straight line',
            'Projectile motion',
            'Newton\'s laws of motion',
            'Friction - static and kinetic',
            'Circular motion',
            'Centripetal force'
        ]
    },
    {
        id: 'phy-2',
        name: 'Work, Energy & Power',
        weightage: 'high',
        totalDays: 8,
        description: 'Work-energy theorem, power, potential energy, conservation laws, collisions.',
        subtopics: [
            'Work and its types',
            'Kinetic and potential energy',
            'Power',
            'Work-energy theorem',
            'Collisions - elastic and inelastic',
            'Conservation laws'
        ]
    },
    {
        id: 'phy-3',
        name: 'Rotational Motion',
        weightage: 'medium',
        totalDays: 8,
        description: 'Centre of mass, torque, angular momentum, moment of inertia, rolling motion.',
        subtopics: [
            'Centre of mass',
            'Torque and rotational motion',
            'Moment of inertia',
            'Angular momentum',
            'Conservation of angular momentum',
            'Rolling motion'
        ]
    },
    {
        id: 'phy-4',
        name: 'Electrostatics',
        weightage: 'high',
        totalDays: 10,
        description: 'Electric charges, Coulomb\'s law, electric field, potential, Gauss\'s law, capacitance.',
        subtopics: [
            'Electric charges and fields',
            'Coulomb\'s law',
            'Electric field intensity',
            'Electric potential',
            'Gauss\'s law',
            'Capacitors and capacitance'
        ]
    },
    {
        id: 'phy-5',
        name: 'Current Electricity & Magnetism',
        weightage: 'high',
        totalDays: 10,
        description: 'Ohm\'s law, resistance, circuits, Kirchhoff\'s laws, magnetic effects, inductance.',
        subtopics: [
            'Ohm\'s law',
            'Resistance and resistivity',
            'Series and parallel circuits',
            'Kirchhoff\'s laws',
            'Magnetic effects of current',
            'Inductance'
        ]
    },
    {
        id: 'phy-6',
        name: 'Modern Physics',
        weightage: 'medium',
        totalDays: 8,
        description: 'Dual nature, photoelectric effect, atomic physics, semiconductors, communication systems.',
        subtopics: [
            'Photoelectric effect',
            'Bohr\'s atomic model',
            'De Broglie hypothesis',
            'Quantum mechanics basics',
            'Semiconductors',
            'Communication systems'
        ]
    },

    // CHEMISTRY (Medium-High Weightage)
    {
        id: 'chem-1',
        name: 'Some Basic Concepts of Chemistry',
        weightage: 'medium',
        totalDays: 6,
        description: 'Mole concept, stoichiometry, atomic mass, molar mass, percentage composition.',
        subtopics: [
            'Matter and its nature',
            'Mole concept',
            'Stoichiometry',
            'Atomic and molecular mass',
            'Percentage composition',
            'Empirical and molecular formula'
        ]
    },
    {
        id: 'chem-2',
        name: 'Atomic Structure',
        weightage: 'medium',
        totalDays: 8,
        description: 'Bohr model, quantum numbers, electron configuration, Pauli\'s exclusion principle.',
        subtopics: [
            'Bohr\'s model',
            'Quantum numbers',
            'Electron configuration',
            'Pauli\'s exclusion principle',
            'Aufbau principle',
            'Hund\'s rule'
        ]
    },
    {
        id: 'chem-3',
        name: 'Chemical Bonding',
        weightage: 'high',
        totalDays: 10,
        description: 'Ionic/covalent bonds, VSEPR theory, hybridization, molecular orbital theory.',
        subtopics: [
            'Ionic and covalent bonds',
            'VSEPR theory',
            'Valence bond theory',
            'Hybridization',
            'Molecular orbital theory',
            'Bond order and magnetism'
        ]
    },
    {
        id: 'chem-4',
        name: 'Chemical Thermodynamics',
        weightage: 'medium',
        totalDays: 8,
        description: 'First and second laws, enthalpy, entropy, Gibbs free energy, spontaneity.',
        subtopics: [
            'System and surroundings',
            'First law of thermodynamics',
            'Enthalpy and heat capacity',
            'Second law',
            'Entropy',
            'Gibbs free energy'
        ]
    },
    {
        id: 'chem-5',
        name: 'Equilibrium',
        weightage: 'high',
        totalDays: 10,
        description: 'Chemical equilibrium, Le Chatelier\'s principle, acids-bases, solubility product.',
        subtopics: [
            'Equilibrium constant',
            'Le Chatelier\'s principle',
            'Acids and bases - Arrhenius, Bronsted, Lewis',
            'pH and pOH',
            'Buffer solutions',
            'Solubility equilibrium'
        ]
    },
    {
        id: 'chem-6',
        name: 'Redox Reactions',
        weightage: 'medium',
        totalDays: 6,
        description: 'Oxidation-reduction, balancing equations, electrode potential, electrochemical cells.',
        subtopics: [
            'Oxidation and reduction',
            'Balancing redox reactions',
            'Electrode potential',
            'Nernst equation',
            'Electrochemical cells',
            'Corrosion'
        ]
    },

    // COMPUTER FUNDAMENTALS (High Weightage)
    {
        id: 'cs-1',
        name: 'Computer Fundamentals & Organization',
        weightage: 'high',
        totalDays: 12,
        description: 'Computer types, organization, I/O devices, memory hierarchy, CPU architecture.',
        subtopics: [
            'Computer types and classification',
            'Basic organization',
            'Input/Output devices',
            'Memory hierarchy',
            'CPU organization',
            'Von Neumann architecture'
        ]
    },
    {
        id: 'cs-2',
        name: 'Programming Fundamentals (C/C++)',
        weightage: 'high',
        totalDays: 15,
        description: 'Basic syntax, operators, control structures, functions, arrays, pointers, strings.',
        subtopics: [
            'Introduction to programming',
            'Variables and data types',
            'Operators and expressions',
            'Control statements (if, switch)',
            'Loops (for, while, do-while)',
            'Functions',
            'Arrays and strings',
            'Pointers basics'
        ]
    },
    {
        id: 'cs-3',
        name: 'Data Structures',
        weightage: 'high',
        totalDays: 18,
        description: 'Arrays, linked lists, stacks, queues, trees, graphs, hash tables, algorithms.',
        subtopics: [
            'Arrays and matrices',
            'Linked lists (SLL, DLL, CLL)',
            'Stacks and applications',
            'Queues and variants',
            'Trees - binary, BST, AVL',
            'Graphs - representation and traversal',
            'Hashing techniques',
            'Heaps'
        ]
    },
    {
        id: 'cs-4',
        name: 'Algorithms',
        weightage: 'high',
        totalDays: 15,
        description: 'Algorithm analysis, sorting, searching, graph algorithms, dynamic programming, greedy.',
        subtopics: [
            'Algorithm design techniques',
            'Time and space complexity',
            'Sorting algorithms (Quick, Merge, Heap)',
            'Searching algorithms',
            'Graph algorithms (BFS, DFS, Dijkstra)',
            'Dynamic programming',
            'Greedy algorithms',
            'Divide and conquer'
        ]
    },
    {
        id: 'cs-5',
        name: 'Database Management Systems (DBMS)',
        weightage: 'medium',
        totalDays: 12,
        description: 'ER model, relational algebra, SQL, normalization, transactions, concurrency.',
        subtopics: [
            'ER diagrams and modeling',
            'Relational model',
            'Relational algebra and calculus',
            'SQL - DDL, DML, DCL',
            'Normalization (1NF to BCNF)',
            'Transactions and ACID',
            'Concurrency control',
            'Indexing and hashing'
        ]
    },
    {
        id: 'cs-6',
        name: 'Operating Systems',
        weightage: 'medium',
        totalDays: 12,
        description: 'Processes, threads, scheduling, synchronization, deadlocks, memory management.',
        subtopics: [
            'Process and threads',
            'CPU scheduling algorithms',
            'Process synchronization',
            'Deadlocks and handling',
            'Memory management',
            'Virtual memory',
            'File systems',
            'I/O systems'
        ]
    },
    {
        id: 'cs-7',
        name: 'Computer Networks',
        weightage: 'medium',
        totalDays: 10,
        description: 'OSI model, TCP/IP, routing, congestion control, application layer protocols.',
        subtopics: [
            'Network models (OSI, TCP/IP)',
            'Physical and data link layer',
            'Network layer - IP, routing',
            'Transport layer - TCP, UDP',
            'Congestion control',
            'Application layer protocols',
            'Network security basics'
        ]
    },
    {
        id: 'cs-8',
        name: 'Web Technologies',
        weightage: 'low',
        totalDays: 8,
        description: 'HTML, CSS, JavaScript basics, client-server model, web services.',
        subtopics: [
            'HTML basics',
            'CSS fundamentals',
            'JavaScript introduction',
            'Client-server architecture',
            'HTTP/HTTPS',
            'Web services (SOAP, REST)',
            'XML and JSON'
        ]
    },
    {
        id: 'cs-9',
        name: 'Software Engineering',
        weightage: 'medium',
        totalDays: 10,
        description: 'SDLC models, requirements, design patterns, testing, project management.',
        subtopics: [
            'Software process models',
            'Requirements engineering',
            'Software design principles',
            'Design patterns basics',
            'Testing fundamentals',
            'Project management',
            'Software metrics'
        ]
    },
    {
        id: 'cs-10',
        name: 'Digital Logic & Computer Arithmetic',
        weightage: 'medium',
        totalDays: 8,
        description: 'Number systems, logic gates, Boolean algebra, combinational/sequential circuits.',
        subtopics: [
            'Number systems and conversions',
            'Coding schemes (ASCII, Unicode)',
            'Boolean algebra',
            'Logic gates and minimization',
            'Combinational circuits',
            'Sequential circuits - flip-flops',
            'Counters and registers'
        ]
    }
];

// Default personal tasks template
const DEFAULT_PERSONAL_TASKS = [
    {
        id: 'task-1',
        title: 'Revise Mathematics formulae',
        description: 'Go through all important formulas from all math chapters',
        priority: 'high',
        completed: false,
        dueDate: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'task-2',
        title: 'Practice Programming Problems',
        description: 'Solve at least 5 problems on arrays and linked lists',
        priority: 'high',
        completed: false,
        dueDate: null,
        createdAt: new Date().toISOString()
    },
    {
        id: 'task-3',
        title: 'Take Mock Test',
        description: 'Complete full-length mock test for practice',
        priority: 'medium',
        completed: false,
        dueDate: null,
        createdAt: new Date().toISOString()
    }
];

// Export default data
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEFAULT_CHAPTERS, DEFAULT_PERSONAL_TASKS };
}
