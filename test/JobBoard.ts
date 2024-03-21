import { expect } from 'chai'
import { deployments } from 'hardhat'
import { Contract, ContractFactory, parseEther } from 'ethers'
import { describe } from 'node:test'
import { Signer } from 'ethers'
import { parse } from 'path'

describe('JobBoard', function () {
  describe('Deployment', function () {
    let MainToken: ContractFactory
    let RewardToken: ContractFactory
    let StakingRewards: ContractFactory
    let JobBoard: ContractFactory
    let mainTokenContract: any
    let rewardTokenContract: any
    let stakingRewardsConract: any
    let jobBoardContract: any
    let accounts: Signer[]
    beforeEach(async function () {
      accounts = await ethers.getSigners()
    })
    it('Should deploy JobBoard', async function () {
      MainToken = await ethers.getContractFactory('MainToken')
      mainTokenContract = await MainToken.deploy()
      RewardToken = await ethers.getContractFactory('RewardToken')
      rewardTokenContract = await RewardToken.deploy()
      JobBoard = await ethers.getContractFactory('JobBoard')
      jobBoardContract = await JobBoard.deploy(mainTokenContract.target)
      StakingRewards = await ethers.getContractFactory('StakingRewards')
      stakingRewardsConract = await StakingRewards.deploy(
        mainTokenContract.target,
        rewardTokenContract.target,
        jobBoardContract.target
      )
    })
    describe('Post Job', function () {
      it('Staking First', async () => {
        await mainTokenContract.approve(
          stakingRewardsConract.target,
          parseEther('10000')
        )
        await mainTokenContract.approve(
          jobBoardContract.target,
          parseEther('10000')
        )
        await stakingRewardsConract.stake(parseEther('1000'))
      })
      it('Job Posting', async () => {
        await jobBoardContract.postJob(
          'Sr. Backend Dev',
          'Backend Developer',
          'Java, Python',
          'remote',
          120000,
          150000,
          'https://vercel.com'
        )
        await jobBoardContract.postJob(
          'Sr. Backend Dev',
          'Backend Developer',
          'Java, Python',
          'remote',
          120000,
          150000,
          'https://vercel.com'
        )
        const jobCount = await jobBoardContract.jobCount()
        expect(jobCount).to.equal(2)
      })
      it('Job Applying', async () => {
        await jobBoardContract.applyForJob(
          1,
          'Sr. Blockchain Dev here.',
          'remote',
          1200000
        )
        await jobBoardContract.applyForJob(
          0,
          'Sr. Blockchain Dev here.',
          'remote',
          120000
        )
        const jobCount = await jobBoardContract.jobCount()
        const jobList = await jobBoardContract.getAllJobs(accounts[1])
        console.log(jobList)
        const applications = await jobBoardContract.getApplications(1)
        console.log(applications)
        const applicationQuality =
          await jobBoardContract.getApplicationsQuality(accounts[0])
        console.log(applicationQuality)
        expect(jobCount).to.equal(2)
      })
    })
  })
})
