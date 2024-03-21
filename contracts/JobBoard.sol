// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.24;

import 'hardhat/console.sol';
import './interfaces/IERC20.sol';
import './interfaces/IStaking.sol';

contract JobBoard {
  IERC20 public immutable mainToken;

  uint256 public tokenAmountForPosting;
  uint256 public tokenAmountForApplying;

  address public owner;

  struct Application {
    address candidate;
    string application;
    uint salary;
    string location;
    uint timestamp;
  }

  struct Job {
    address employer;
    string title;
    string description;
    string qualifications;
    uint salaryFrom;
    uint salaryTo;
    string location;
    string siteURL;
    uint timestamp;
    mapping(address => uint) applied;
    Application[] applications;
  }

  struct JobList {
    address employer;
    uint id;
    string title;
    string description;
    string qualifications;
    string location;
    uint salaryFrom;
    uint salaryTo;
    uint applicationCount;
    bool applied;
    string siteURL;
    uint timestamp;
  }

  mapping(uint => Job) public jobs;
  uint public jobCount;

  event JobPosted(
    uint jobId,
    address indexed employer,
    string indexed title,
    string location,
    uint salaryFrom,
    uint salaryTo,
    string description,
    string qualifications,
    uint timestamp
  );
  event JobApplied(
    address indexed applicant,
    uint indexed jobId,
    string application,
    uint salary,
    string location,
    uint timestamp
  );

  modifier onlyOwner() {
    require(msg.sender == owner, 'not authorized');
    _;
  }

  modifier onlyTokenHolder(uint limit) {
    uint tokenAmount = mainToken.balanceOf(msg.sender);
    require(tokenAmount > limit, 'Insufficient Token Balance.');
    _;
  }

  constructor(address _tokenAddress) {
    owner = msg.sender;
    mainToken = IERC20(_tokenAddress);
    tokenAmountForApplying = 1 * 1e18;
    tokenAmountForPosting = 2 * 1e18;
  }

  function trasnferOwner(address _address) public onlyOwner {
    owner = _address;
  }

  function postJob(
    string memory _title,
    string memory _description,
    string memory _qualifications,
    string memory _location,
    uint _salaryFrom,
    uint _salaryTo,
    string memory _siteURL
  ) external onlyTokenHolder(tokenAmountForPosting) {
    Job storage newJob = jobs[jobCount];
    mainToken.transferFrom(msg.sender, owner, tokenAmountForPosting);
    newJob.employer = msg.sender;
    newJob.title = _title;
    newJob.description = _description;
    newJob.qualifications = _qualifications;
    newJob.location = _location;
    newJob.salaryFrom = _salaryFrom;
    newJob.salaryTo = _salaryTo;
    newJob.timestamp = block.timestamp;
    newJob.siteURL = _siteURL;

    emit JobPosted(
      jobCount,
      msg.sender,
      _title,
      _location,
      _salaryFrom,
      _salaryTo,
      _description,
      _qualifications,
      block.timestamp
    );
    jobCount++;
  }

  function setTokenAmountForPosting(uint256 _tokenAmount) public onlyOwner {
    tokenAmountForPosting = _tokenAmount;
  }

  function setTokenAmountForApplying(uint256 _tokenAmount) public onlyOwner {
    tokenAmountForApplying = _tokenAmount;
  }

  function applyForJob(
    uint _jobId,
    string memory _application,
    string memory _location,
    uint _salary
  ) external onlyTokenHolder(tokenAmountForApplying) {
    mainToken.transferFrom(msg.sender, owner, tokenAmountForApplying);
    require(jobs[_jobId].applied[msg.sender] == 0, 'Already applied');
    jobs[_jobId].applied[msg.sender] = jobs[_jobId].applications.length + 1;
    jobs[_jobId].applications.push(
      Application(msg.sender, _application, _salary, _location, block.timestamp)
    );
    emit JobApplied(
      msg.sender,
      _jobId,
      _application,
      _salary,
      _location,
      block.timestamp
    );
  }

  function getAllJobs(
    address _address
  ) external view returns (JobList[] memory) {
    JobList[] memory jobList = new JobList[](jobCount);
    for (uint i = 0; i < jobCount; i++) {
      jobList[i].employer = jobs[i].employer;
      jobList[i].id = i;
      jobList[i].title = jobs[i].title;
      jobList[i].description = jobs[i].description;
      jobList[i].qualifications = jobs[i].qualifications;
      jobList[i].location = jobs[i].location;
      jobList[i].salaryFrom = jobs[i].salaryFrom;
      jobList[i].salaryTo = jobs[i].salaryTo;
      if (jobs[i].applied[_address] != 0) jobList[i].applied = true;
      else jobList[i].applied = false;
      jobList[i].applicationCount = jobs[i].applications.length;
      jobList[i].siteURL = jobs[i].siteURL;
      jobList[i].timestamp = jobs[i].timestamp;
    }
    return jobList;
  }

  function getApplications(
    uint _jobId
  ) external view returns (Application[] memory) {
    return jobs[_jobId].applications;
  }

  function getApplicationCount(
    address _address
  ) external view returns (uint256) {
    uint256 count = 0;
    for (uint i = 0; i < jobCount; i++) {
      if (jobs[i].applied[_address] != 0) count++;
    }
    return count;
  }

  function getApplicationsQuality(
    address _address
  ) external view returns (uint) {
    uint qualificationScore = 0;
    for (uint i = 0; i < jobCount; i++) {
      if (jobs[i].applied[_address] != 0) {
        uint candidateSalary = jobs[i]
          .applications[jobs[i].applied[_address] - 1]
          .salary;
        string memory candidateLocation = jobs[i]
          .applications[jobs[i].applied[_address] - 1]
          .location;
        bytes memory candidateApplication = bytes(
          jobs[i].applications[jobs[i].applied[_address] - 1].application
        );
        if (
          jobs[i].salaryFrom <= candidateSalary &&
          candidateSalary <= jobs[i].salaryTo
        ) qualificationScore += 1;
        if (
          keccak256(abi.encodePacked(jobs[i].location)) ==
          keccak256(abi.encodePacked(candidateLocation))
        ) qualificationScore += 2;
        if (candidateApplication.length >= 100) qualificationScore += 2;
      }
    }
    return qualificationScore;
  }
}
