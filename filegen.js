/////
/////
/////this File contain of multiple classes 
/////each classes supposed to park into individual JS files
/////but for this assessment I put all in one file only for 
/////readability and reduce complexity, but in real project
/////each classes much have a JS file and allocate the code
/////
/////
/////








/////this is the main function to control the logic of generating the file
generate = async function () {

  ///creating instance of MainGenerator class
  let mainGen = new MainGenerator();

  ///initializing the required generator 
  ///design this way to let the generator to behave as required
  ///it would be more flexible this way if requirement changed or 
  ///need to add a new type of object
  mainGen.addObjectGenerator(new AlphabeticalStringGenerator(), 23);
  mainGen.addObjectGenerator(new RealNumberGenerator(), 23);
  mainGen.addObjectGenerator(new IntegerGenerator(), 30);
  mainGen.addObjectGenerator(new AlphanumericGenerator(), 24);

  ///execute the process of randomize and generate the random contents
  mainGen.process();

  ///save into the save
  const fileAddress = mainGen.saveContentToFile();

  ///generate the report from memory
  const result = mainGen.getReport();

  ///create a report structure 
  const response = { reports: result, fileAddress };

  ///save the report into a file for next usage
  mainGen.saveReportToFile(JSON.stringify(response));
  
  ///return the full response 
  return response;
};


/////this is the function that helps on reading from file and return the values
getReport = async function () {
  ///creating instance of MainGenerator class
  let mainGen = new MainGenerator();

  ///read from file and return the data
  const data = JSON.parse(mainGen.readReportFromFile());

  ///return the full response
  return data;
};


/////this class is the main class for generating the random objects and control over the file
class MainGenerator {
  constructor(fileSize = 2000000, maxObjectSize = 20, reportFileName = 'report.txt') {

    ///initialize the object
    this.file = new File(fileSize);
    this.maxObjectSize = maxObjectSize;
    this.objectGenerators = [];
    this.utility = new Utility();
    this.reportFileName = reportFileName;
    this.probCounter = 0
  }

  ///to add object generator class
  addObjectGenerator(objectGenerator, prob) {
    this.objectGenerators.push({objectGenerator, from: this.probCounter, to: this.probCounter + prob});
    this.probCounter+= prob
  }

  ///main function to start creating random objects 
  process() {
    do {
      const selectedGenerator = this.randomizeSelection()
      const nextLength =
        this.file.howMuchMore() < this.maxObjectSize
          ? this.file.howMuchMore()
          : this.maxObjectSize;
      const newRandomValue = selectedGenerator.next(nextLength);
      this.file.addContent(newRandomValue);
    } while (this.file.howMuchMore());
  }

  randomizeSelection() {
    const ranNumber = this.utility.generateRandom(0, 100)
    for (let index = 0; index < this.objectGenerators.length; index++) {
      const element = this.objectGenerators[index];
      if(element.from <= ranNumber && element.to > ranNumber ) {
        return element.objectGenerator
      }
    }
  }

  ///triggers the save function fron the file object
  saveContentToFile() {
    return this.file.saveContentToFile();
  }

  ///generates the report from all generators
  getReport() {
    let list = [];
    for (let index = 0; index < this.objectGenerators.length; index++) {
      const objectGenerator = this.objectGenerators[index];
      list.push(objectGenerator.toString());
    }
    return list;
  }

  ///saves the report into the file
  saveReportToFile(content) {
    const fileName = this.reportFileName;
    return this.utility.saveToFile(fileName, content);
  }

  ///reads the report from the file
  readReportFromFile() {
    const content = this.utility.readFromFile(this.reportFileName);
    return content;
  }
}

/////this class helps to manage the file
class File {
  constructor(maxSize) {

    ///records current size of the file
    this.totalSize = 0;

    ///saves all the objects here
    this.fileContent = "";

    ///initiate the max size of the file
    this.maxSize = maxSize;

    ///to make use of utility functions
    this.utility = new Utility();

    ///initialize the file with first object
    this.initialize();
  }

  ///Generates the UUID value for the file name
  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  ///initialize the file with first object
  initialize() {
    let str = "";
    for (var i = 0; i <= 10; i++) {
      str += this.utility.generateRandomAlphanumeric();
    }
    this.fileContent = str;
    this.totalSize = this.fileContent.length;
  }

  ///saves the content into the file
  saveContentToFile() {
    const newFileName = this.uuidv4() + ".txt";
    return this.utility.saveToFile(newFileName, this.fileContent);
  }

  ///to return available capacity
  howMuchMore() {
    return this.maxSize - this.totalSize;
  }

  ///add new object to content
  addContent(content) {
    if (this.totalSize + content.length + 1 <= this.maxSize) {
      this.fileContent += "," + content;
      this.totalSize += content.length + 1;
    }
    return this.maxSize - this.totalSize;
  }
}


///Base class for all the generator to generalise the common functions
class BaseGenerator {
  constructor(classString) {

    ///this is count how many time a generator have executed 
    this.count = 0;

    ///to make use of utility functions
    this.utility = new Utility();

    ///it holds the name of generator
    this.classString = classString;
  }

  ///returns the current value of the generator
  getCount() {
    return this.count;
  }

  ///increase the current have by one number
  addCount() {
    this.count++;
  }

  ///triggers the logic of the generator
  next(requireLength) {
    this.addCount();
    const result = this.generateNext(requireLength);
    return result;
  }

  ///return utility object
  getUtility() {
    return this.utility;
  }

  ///generates class name and its current value for report 
  toString() {
    return `${this.classString}: ${this.count}`;
  }
}


///this is a generator class to create random Alphanetical String
class AlphabeticalStringGenerator extends BaseGenerator {
  constructor() {
    super("Alphabetical Strings");

    ///declares the logic of this generator
    super.generateNext = (requireLength) => {
      let nextString = "";
      const length = super.getUtility().generateRandom(1, requireLength);
      for (let index = 0; index < length; index++) {
        nextString += super.getUtility().generateRandomAphabet();
      }
      return nextString;
    };
  }
}

///this is a generator class to create random Real Number
class RealNumberGenerator extends BaseGenerator {
  constructor() {
    super("Real Numbers");

    ///declares the logic of this generator
    super.generateNext = (requireLength) => {
      let nextString = "";
      const length = super.getUtility().generateRandom(1, requireLength - 2);
      for (let index = 0; index < length; index++) {
        nextString += super.getUtility().generateRandomNumber();
      }
      if (requireLength - length > 2) {
        const lengthAfterDot = super
          .getUtility()
          .generateRandom(1, requireLength - length);
        nextString += ".";
        for (let index = 0; index < lengthAfterDot; index++) {
          nextString += super.getUtility().generateRandomNumber();
        }
      }
      return nextString;
    };
  }
}

///this is a generator class to create random Integer
class IntegerGenerator extends BaseGenerator {
  constructor() {
    super("Integers");

    ///declares the logic of this generator
    super.generateNext = (requireLength) => {
      let nextString = "";
      const length = super.getUtility().generateRandom(1, requireLength);
      for (let index = 0; index < length; index++) {
        nextString += super.getUtility().generateRandomNumber();
      }
      return nextString;
    };
  }
}

///this is a generator class to create random Alphanumeric String
class AlphanumericGenerator extends BaseGenerator {
  constructor() {
    super("Alphanumerics");

    ///declares the logic of this generator
    super.generateNext = (requireLength) => {
      let nextString = "";
      const length = super.getUtility().generateRandom(1, requireLength);
      for (let index = 0; index < length; index++) {
        nextString += super.getUtility().generateRandomAlphanumeric();
      }
      return nextString;
    };
  }
}


///this class is to implement common codes that would be used in different classes
class Utility {
  constructor() {}

  ///generates one single random character
  generateRandomAphabet() {
    return String.fromCharCode(this.generateRandom(97, 123));
  }

  ///generates one single random number
  generateRandomNumber() {
    return this.generateRandom(0, 10);
  }

  ///generates one single random Alphnumeric character
  generateRandomAlphanumeric() {
    if (this.generateRandom(0, 2)) {
      return this.generateRandomAphabet();
    } else {
      return this.generateRandomNumber();
    }
  }

  ///generates one single random number between the specified range
  generateRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  ///saves the string to file
  saveToFile(fileName, content) {
    const fs = require("fs");
    try {
      fs.writeFile("uploads/" + fileName, content, function () {});
      return fileName;
    } catch (error) {
      console.log(error, "err.....");
      return null;
    }
  }

  ///reads from the file
  readFromFile(fileName) {
    const fs = require("fs");
    try {
      const data = fs.readFileSync("uploads/" + fileName, "utf8");
      console.log(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  }
}

exports.generate = generate;
exports.getReport = getReport;
