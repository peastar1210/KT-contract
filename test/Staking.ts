import { expect } from 'chai'
import { deployments } from 'hardhat'
import { Contract, ContractFactory, parseEther } from 'ethers'
import { describe } from 'node:test'
import { Signer } from 'ethers'

describe('StakingRewards', function () {
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

    beforeEach(async () => {
      accounts = await ethers.getSigners()
    })
    it('Should deploy StakingRewards', async function () {
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
    describe('Staking', function () {
      it('staking start', async () => {
        await rewardTokenContract.transfer(
          stakingRewardsConract.target,
          parseEther('1000')
        )
        await stakingRewardsConract.setRewardsDuration(120 * 24 * 3600)
        await stakingRewardsConract.notifyRewardAmount(parseEther('400'))
        const earned = await stakingRewardsConract.earned(accounts[0])
        console.log('earned', earned)
      })
      it('stake', async () => {
        await mainTokenContract.approve(
          stakingRewardsConract.target,
          parseEther('1000')
        )
        await stakingRewardsConract.stake(parseEther('1000'), {
          from: accounts[0],
        })
        const totalSupply = await stakingRewardsConract.totalSupply()
        expect(totalSupply).to.equal(parseEther('1000'))
        const balance = await stakingRewardsConract.balanceOf(accounts[0])
        await stakingRewardsConract.withdraw(parseEther('400'))
        const balanceAfter = await stakingRewardsConract.balanceOf(accounts[0])
        await stakingRewardsConract.getReward()
      })
    })
  })
})
