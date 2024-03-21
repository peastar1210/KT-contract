import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import fs from 'fs'

const deployJobBoard: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts()
  const { deploy, get } = hre.deployments

  const mainTokenContract = await get('MainToken')
  // const stakingContract = await get('StakingRewards')

  await deploy('JobBoard', {
    from: deployer,
    // Contract constructor arguments
    args: [mainTokenContract.address /*, stakingContract.address*/],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  })

  const jobBoard = await get('JobBoard')

  const data = {
    address: jobBoard.address.substring(2),
    abi: jobBoard.abi,
  }
  console.log(jobBoard.address)

  //This writes the ABI and address to the marketplace.json
  //This data is then used by frontend files to connect with the smart contract
  fs.writeFileSync(
    '../kata-frontend/contracts/JobBoard.json',
    JSON.stringify(data)
  )
}

export default deployJobBoard

deployJobBoard.tags = ['JobBoard']
