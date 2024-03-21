import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import fs from 'fs'

const deployRewardToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, get } = hre.deployments

  await deploy('RewardToken', {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  })

  const rewardToken = await get('RewardToken')

  const data = {
    address: rewardToken.address.substring(2),
    abi: rewardToken.abi,
  }
  console.log(rewardToken.address)

  //This writes the ABI and address to the marketplace.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync(
    '../kata-frontend/contracts/RewardToken.json',
    JSON.stringify(data)
  )
}

export default deployRewardToken

deployRewardToken.tags = ['RewardToken']
