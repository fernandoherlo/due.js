// Emisor MIDI de prueba (macOS): crea el puerto virtual "due-test" y envia un CC que sube y baja de 0 a 127.
// Uso: npm run midi -- <canal 1-16> <controlador 0-127>   (por defecto 1 y 1)
// Ejemplo: npm run midi -- 1 5  ->  prueba `$$test=mi0(1@5)`. Recargar la pagina para que el navegador detecte el puerto.
import CoreMIDI
import Foundation

var client = MIDIClientRef()
MIDIClientCreate("due-test" as CFString, nil, nil, &client)
var source = MIDIEndpointRef()
MIDISourceCreate(client, "due-test" as CFString, &source)

let channel = UInt8(CommandLine.arguments.count > 1 ? Int(CommandLine.arguments[1])! - 1 : 0)
let controller = UInt8(CommandLine.arguments.count > 2 ? Int(CommandLine.arguments[2])! : 1)

print("Puerto virtual 'due-test'. Enviando CC \(controller) en canal \(channel + 1) (0..127..0). Ctrl+C para salir.")
var value = 0
var step = 4
while true {
  var packet = MIDIPacket()
  packet.timeStamp = 0
  packet.length = 3
  packet.data.0 = 0xB0 | channel
  packet.data.1 = controller
  packet.data.2 = UInt8(value)
  var list = MIDIPacketList(numPackets: 1, packet: packet)
  MIDIReceived(source, &list)
  print("CC \(controller) = \(value)")
  value += step
  if value >= 127 { value = 127; step = -4 }
  if value <= 0 { value = 0; step = 4 }
  Thread.sleep(forTimeInterval: 0.1)
}
