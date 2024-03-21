import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import fs from 'fs'

const deployStaking: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, get } = hre.deployments

  const mainTokenContract = await get('MainToken')
  const rewardTokenContract = await get('RewardToken')
  const jobBoardContract = await get('JobBoard')

  const deployResult = await deploy('StakingRewards', {
    from: deployer,
    // Contract constructor arguments
    args: [
      mainTokenContract.address,
      rewardTokenContract.address,
      jobBoardContract.address,
    ],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  })

  const stakingRewards = await get('StakingRewards')

  const data = {
    address: stakingRewards.address.substring(2),
    abi: stakingRewards.abi,
  }
  console.log(stakingRewards.address)

  //This writes the ABI and address to the marketplace.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync(
    '../kata-frontend/contracts/StakingRewards.json',
    JSON.stringify(data)
  )
}

export default deployStaking

deployStaking.tags = ['StakingRewards']
